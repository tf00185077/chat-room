import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { getCurrentUserId } from '../../../../../lib/getSession';
import { getPusherServer } from '../../../../../lib/pusher';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const conversationId = Number(id);
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // 檢查對話是否存在
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: true,
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // 檢查使用者是否在對話中
    const isParticipant = conversation.participants.some(
      (p) => p.userId === currentUserId
    );

    if (!isParticipant) {
      return NextResponse.json(
        { error: 'You are not a participant of this conversation' },
        { status: 403 }
      );
    }

    // 檢查使用者是否已經是參與者
    const alreadyParticipant = conversation.participants.some(
      (p) => p.userId === Number(userId)
    );

    if (alreadyParticipant) {
      return NextResponse.json(
        { error: 'User is already a participant' },
        { status: 400 }
      );
    }

    // 檢查要添加的用戶是否存在
    const userToAdd = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });

    if (!userToAdd) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // 新增參與者
    await prisma.conversationParticipant.create({
      data: {
        conversationId,
        userId: Number(userId),
      },
    });

    // 創建系統訊息通知新成員加入
    const systemMessage = await prisma.message.create({
      data: {
        conversationId,
        senderId: null, // 系統訊息
        type: 'system',
        content: `${userToAdd.name} 已加入對話`,
      },
    });

    // 更新對話的 updatedAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // 獲取更新後的參與者列表
    const updatedConversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
      },
    });

    const participants = updatedConversation?.participants.map((p) => ({
      id: p.user.id,
      name: p.user.name,
      avatarUrl: p.user.avatarUrl,
    })) || [];

    // 通過 Pusher 通知所有參與者
    const pusher = getPusherServer();
    const channelName = `conversation-${conversationId}`;
    if (pusher) {
      try {
        // 通知參與者列表更新
        await pusher.trigger(channelName, "participants-updated", {
          participants,
        });

        // 通知新系統訊息
        const messageData = {
          id: systemMessage.id,
          conversationId: systemMessage.conversationId,
          senderId: systemMessage.senderId,
          type: systemMessage.type,
          content: systemMessage.content,
          createdAt: systemMessage.createdAt.toISOString(),
          senderName: '系統',
          senderAvatar: '',
          reactions: [],
        };
        await pusher.trigger(channelName, "new-message", messageData);
      } catch (error) {
        console.error("Error broadcasting via Pusher:", error);
      }
    }

    return NextResponse.json({
      success: true,
      participants,
      message: 'Participant added successfully',
    });
  } catch (error) {
    console.error('Error adding participant:', error);
    return NextResponse.json(
      { error: 'Failed to add participant' },
      { status: 500 }
    );
  }
}
