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
    const { conversationId, content } = body;

    if (!conversationId || !content || !content.trim()) {
      return NextResponse.json(
        { error: 'conversationId and content are required' },
        { status: 400 }
      );
    }

    // 創建新訊息
    const message = await prisma.message.create({
      data: {
        conversationId: Number(conversationId),
        senderId: userId,
        type: 'text',
        content: content.trim(),
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
