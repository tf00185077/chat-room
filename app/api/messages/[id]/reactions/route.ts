import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { getCurrentUserId } from '../../../../../lib/getSession';
import { getPusherServer } from '../../../../../lib/pusher';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const messageId = Number(id);
    const body = await request.json();
    const { type } = body;

    if (!type || !['like', 'love', 'laugh'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid reaction type' },
        { status: 400 }
      );
    }

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        sender: true,
      },
    });

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    const existing = await prisma.messageReaction.findUnique({
      where: {
        messageId_userId_type: {
          messageId,
          userId,
          type,
        },
      },
    });

    let reaction;
    if (existing) {
      await prisma.messageReaction.delete({
        where: {
          id: existing.id,
        },
      });
      reaction = null;
    } else {
      reaction = await prisma.messageReaction.create({
        data: {
          messageId,
          userId,
          type,
        },
      });
    }

    const reactions = await prisma.messageReaction.findMany({
      where: { messageId },
    });

    const updatedMessage = {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      type: message.type,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
      senderName: message.sender?.name || '系統',
      senderAvatar: message.sender?.avatarUrl || '',
      reactions: reactions.map((r) => ({
        id: r.id,
        messageId: r.messageId,
        userId: r.userId,
        type: r.type,
      })),
    };

    // 通過 Pusher 廣播更新後的訊息
    const pusher = getPusherServer();
    const channelName = `conversation-${message.conversationId}`;
    if (pusher) {
      try {
        await pusher.trigger(channelName, "message-updated", updatedMessage);
      } catch (error) {
        console.error("Error broadcasting message update via Pusher:", error);
      }
    }

    return NextResponse.json({
      reaction,
      reactions: reactions.map((r) => ({
        id: r.id,
        messageId: r.messageId,
        userId: r.userId,
        type: r.type,
      })),
    });
  } catch (error) {
    console.error('Error toggling reaction:', error);
    return NextResponse.json(
      { error: 'Failed to toggle reaction' },
      { status: 500 }
    );
  }
}
