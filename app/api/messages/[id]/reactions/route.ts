import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { getCurrentUserId } from '../../../../../lib/getSession';

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

    // 檢查是否已經有這個反應
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
      // 如果存在，則刪除（取消反應）
      await prisma.messageReaction.delete({
        where: {
          id: existing.id,
        },
      });
      reaction = null;
    } else {
      // 如果不存在，則創建
      reaction = await prisma.messageReaction.create({
        data: {
          messageId,
          userId,
          type,
        },
      });
    }

    // 獲取更新後的所有反應
    const reactions = await prisma.messageReaction.findMany({
      where: { messageId },
    });

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
