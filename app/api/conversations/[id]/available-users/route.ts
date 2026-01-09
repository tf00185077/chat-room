import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { getCurrentUserId } from '../../../../../lib/getSession';

export async function GET(
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

    // 檢查對話是否存在並獲取參與者
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

    // 檢查當前用戶是否在對話中
    const isParticipant = conversation.participants.some(
      (p) => p.userId === currentUserId
    );

    if (!isParticipant) {
      return NextResponse.json(
        { error: 'You are not a participant of this conversation' },
        { status: 403 }
      );
    }

    // 獲取參與者 ID 列表
    const participantIds = conversation.participants.map((p) => p.userId);

    // 獲取所有用戶，排除已在對話中的參與者
    const availableUsers = await prisma.user.findMany({
      where: {
        id: {
          notIn: participantIds,
        },
      },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(availableUsers);
  } catch (error) {
    console.error('Error fetching available users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available users' },
      { status: 500 }
    );
  }
}
