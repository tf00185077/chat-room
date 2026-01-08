import { prisma } from './prisma';
import { CURRENT_USER_ID } from '../app/types';
import type { ConversationListItem, ChatRoomData, Message, MessageReaction } from '../app/types';

// 取得對話列表
export async function getConversationList(): Promise<ConversationListItem[]> {
  const conversations = await prisma.conversation.findMany({
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
    const otherParticipant = conv.participants
      .find((p) => p.userId !== CURRENT_USER_ID)?.user ||
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

// 取得聊天室資料
export async function getChatRoomData(
  conversationId: number,
): Promise<ChatRoomData | null> {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participants: {
        include: {
          user: true,
        },
      },
      messages: {
        include: {
          sender: true,
          reactions: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  if (!conversation) {
    return null;
  }

  const participants = conversation.participants.map((p) => ({
    id: p.user.id,
    name: p.user.name,
    avatarUrl: p.user.avatarUrl,
  }));

  const messages: (Message & { reactions: MessageReaction[]; senderName?: string; senderAvatar?: string })[] =
    conversation.messages.map((msg) => ({
      id: msg.id,
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      type: msg.type as "text" | "system",
      content: msg.content,
      createdAt: msg.createdAt.toISOString(),
      senderName: msg.sender?.name || "系統",
      senderAvatar: msg.sender?.avatarUrl || "",
      reactions: msg.reactions.map((r) => ({
        id: r.id,
        messageId: r.messageId,
        userId: r.userId,
        type: r.type as "like" | "love" | "laugh",
      })),
    }));

  return {
    conversation: {
      id: conversation.id,
      createdAt: conversation.createdAt.toISOString(),
    },
    participants,
    messages,
  };
}
