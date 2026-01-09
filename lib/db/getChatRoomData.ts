import { prisma } from '../prisma';
import { ChatRoomData } from '../../app/types';
import { Message, MessageReaction } from '../../app/types';

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
      type: msg.type as "text" | "system" | "image",
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
