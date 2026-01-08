import { prisma } from '../prisma';
import { getCurrentUserId } from '../getSession';
import type { ConversationListItem } from '../../app/types';

export async function getConversationList(): Promise<ConversationListItem[]> {
  const currentUserId = await getCurrentUserId();
  
  // 如果沒有登入，返回空數組
  if (!currentUserId) {
    return [];
  }
  
  const conversations = await prisma.conversation.findMany({
    where: {
      participants: {
        some: {
          userId: currentUserId,
        },
      },
    },
    include: {
      participants: {
        include: {
          user: true,
        },
      },
      messages: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
        include: {
          reactions: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  return conversations.map((conv) => {
    // 找出除了目前使用者外的參與者
    // 注意：此時 currentUserId 一定存在（如果不存在已經提前返回）
    const otherParticipant = conv.participants.find((p) => p.userId !== currentUserId)?.user ||
      conv.participants[0]?.user;

    const lastMessage = conv.messages[0]
      ? {
          id: conv.messages[0].id,
          conversationId: conv.messages[0].conversationId,
          senderId: conv.messages[0].senderId,
          type: conv.messages[0].type as "text" | "system",
          content: conv.messages[0].content,
          createdAt: conv.messages[0].createdAt.toISOString(),
        }
      : null;

    return {
      conversation: {
        id: conv.id,
        createdAt: conv.createdAt.toISOString(),
      },
      otherParticipant: otherParticipant
        ? {
            id: otherParticipant.id,
            name: otherParticipant.name,
            avatarUrl: otherParticipant.avatarUrl,
          }
        : {
            id: 0,
            name: 'Unknown',
            avatarUrl: '',
          },
      lastMessage,
    };
  });
}