import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { CURRENT_USER_ID } from '../../../app/types';

export async function POST(request: NextRequest) {
  try {
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
        senderId: CURRENT_USER_ID,
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

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
}
