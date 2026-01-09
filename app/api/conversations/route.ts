import { getConversationList } from '../../../lib/db/getConversationList';
import { getCurrentUserId } from '../../../lib/getSession';
import { prisma } from '../../../lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const conversations = await getConversationList();
    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { otherUserId } = body;

    if (!otherUserId) {
      return NextResponse.json(
        { error: 'otherUserId is required' },
        { status: 400 }
      );
    }

    const existingConversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: currentUserId,
          },
        },
      },
      include: {
        participants: true,
      },
    });

    for (const conv of existingConversations) {
      const participantIds = conv.participants.map((p) => p.userId);
      const hasBothUsers = 
        participantIds.includes(currentUserId) && 
        participantIds.includes(Number(otherUserId)) &&
        participantIds.length === 2;
      
      if (hasBothUsers) {
        return NextResponse.json({
          id: conv.id,
          message: 'Conversation already exists',
        });
      }
    }

    // 創建新對話
    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [
            { userId: currentUserId },
            { userId: Number(otherUserId) },
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: conversation.id,
      message: 'Conversation created',
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}
