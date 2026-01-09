import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getCurrentUserId } from '../../../lib/getSession';
import { getPusherServer } from '../../../lib/pusher';

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { conversationId, content, type = "text" } = body;

    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId is required' },
        { status: 400 }
      );
    }

    // 驗證訊息類型
    if (type !== "text" && type !== "image") {
      return NextResponse.json(
        { error: 'Invalid message type. Must be "text" or "image"' },
        { status: 400 }
      );
    }

    // 驗證內容
    if (type === "text") {
      if (!content || !content.trim()) {
        return NextResponse.json(
          { error: 'content is required for text messages' },
          { status: 400 }
        );
      }
    } else if (type === "image") {
      if (!content) {
        return NextResponse.json(
          { error: 'content is required for image messages' },
          { status: 400 }
        );
      }

      // 驗證 base64 data URL 格式
      if (!content.startsWith("data:image/")) {
        return NextResponse.json(
          { error: 'Invalid image format. Must be base64 data URL' },
          { status: 400 }
        );
      }

      // 驗證 base64 大小（限制為 5MB base64，約 3.75MB 實際大小）
      const base64Size = content.length * 0.75; // base64 大約是原始大小的 1.33 倍
      const maxBase64Size = 5 * 1024 * 1024; // 5MB
      if (base64Size > maxBase64Size) {
        return NextResponse.json(
          { error: `Image size too large. Maximum size is ${Math.floor(maxBase64Size / 1024 / 1024)}MB` },
          { status: 400 }
        );
      }
    }

    // 創建新訊息
    const message = await prisma.message.create({
      data: {
        conversationId: Number(conversationId),
        senderId: userId,
        type: type,
        content: type === "text" ? content.trim() : content, // 圖片不需要 trim
      },
      include: {
        sender: true,
        reactions: true,
      },
    });

    // 更新 conversation 的 updatedAt
    await prisma.conversation.update({
      where: { id: Number(conversationId) },
      data: { updatedAt: new Date() },
    });

    const messageData = {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      type: message.type,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
      senderName: message.sender?.name || '系統',
      senderAvatar: message.sender?.avatarUrl || '',
      reactions: message.reactions.map((r) => ({
        id: r.id,
        messageId: r.messageId,
        userId: r.userId,
        type: r.type,
      })),
    };

    // 通過 Pusher 廣播新訊息
    const pusher = getPusherServer();
    const channelName = `conversation-${conversationId}`;
    if (pusher) {
      try {
        await pusher.trigger(channelName, "new-message", messageData);
        console.log(`Broadcasting new message to ${channelName}:`, messageData);
      } catch (error) {
        console.error("Error broadcasting message via Pusher:", error);
      }
    } else {
      console.warn("Pusher not configured, message not broadcasted");
    }

    return NextResponse.json(messageData);
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
}
