import {
  User,
  Conversation,
  Message,
  MessageReaction,
  ConversationListItem,
  ChatRoomData,
} from "./types";
import { CURRENT_USER_ID } from "./types";

// ------- 原始 JSON 資料（改成你的格式） -------
const rawData = {
  conversations: [
    {
      id: 1,
      participants: [
        { userId: 4, user: "David", avatar: "https://i.pravatar.cc/150?img=4" },
        { userId: 2, user: "Bob", avatar: "https://i.pravatar.cc/150?img=2" },
      ],
      lastMessage: "I'm building a new side project.",
      timestamp: 1739016600000,
    },
    {
      id: 2,
      participants: [
        { userId: 1, user: "Alice", avatar: "https://i.pravatar.cc/150?img=1" },
        { userId: 3, user: "Charlie", avatar: "https://i.pravatar.cc/150?img=3" },
      ],
      lastMessage: "What's your favorite editor?",
      timestamp: 1739017200000,
    },
  ],
  messages: [
    {
      conversationId: 1,
      userId: 4,
      user: "David",
      avatar: "https://i.pravatar.cc/150?img=4",
      messageType: "text",
      message: "Jest vs Cypress?",
      reactions: { like: 4, love: 2, laugh: 0 },
      timestamp: 1739016000000,
    },
    {
      conversationId: 1,
      userId: 2,
      user: "Bob",
      avatar: "https://i.pravatar.cc/150?img=2",
      messageType: "text",
      message: "Redux or Zustand?",
      reactions: { like: 5, love: 3, laugh: 0 },
      timestamp: 1739016060000,
    },
    {
      conversationId: 1,
      userId: 2,
      user: "Bob",
      avatar: "https://i.pravatar.cc/150?img=2",
      messageType: "text",
      message: "Jest vs Cypress?",
      reactions: { like: 0, love: 0, laugh: 0 },
      timestamp: 1739016120000,
    },
    {
      conversationId: 1,
      userId: 4,
      user: "David",
      avatar: "https://i.pravatar.cc/150?img=4",
      messageType: "text",
      message: "How's it going?",
      reactions: { like: 4, love: 1, laugh: 1 },
      timestamp: 1739016180000,
    },
  ],
};
// ---------------------------------------------

// 建立 Users 資料：從 conversations participants 與 messages 的 user 資訊匯總
const userMap = new Map<number, User>();
const addUser = (id: number, name: string, avatarUrl: string) => {
  if (!userMap.has(id)) {
    userMap.set(id, { id, name, avatarUrl });
  }
};

rawData.conversations.forEach((conv) => {
  conv.participants.forEach((p) => addUser(p.userId, p.user, p.avatar));
});
rawData.messages.forEach((msg) => addUser(msg.userId, msg.user, msg.avatar));

export const mockUsers: User[] = Array.from(userMap.values());

// Conversations
export const mockConversations: Conversation[] = rawData.conversations.map((c) => ({
  id: c.id,
  createdAt: new Date(c.timestamp).toISOString(),
}));

// 生成 reactions 陣列（只有計數，使用虛擬 userId 來填充）
let reactionId = 1;
const createReactions = (
  counts: { like: number; love: number; laugh: number },
  messageId: number,
): MessageReaction[] => {
  const reactions: MessageReaction[] = [];
  const pushMany = (type: "like" | "love" | "laugh", count: number) => {
    for (let i = 0; i < count; i += 1) {
      reactions.push({
        id: reactionId++,
        messageId,
        userId: 1000000 + reactionId, // 虛擬使用者，僅用來表示數量
        type,
      });
    }
  };
  pushMany("like", counts.like);
  pushMany("love", counts.love);
  pushMany("laugh", counts.laugh);
  return reactions;
};

// Messages
export const mockMessages: Message[] = rawData.messages.map((m, idx) => ({
  id: idx + 1,
  conversationId: m.conversationId,
  senderId: m.userId,
  type: m.messageType === "text" ? "text" : "system",
  content: m.message,
  createdAt: new Date(m.timestamp).toISOString(),
}));

// Reactions
export const mockReactions: MessageReaction[] = rawData.messages.flatMap((m, idx) =>
  createReactions(m.reactions, idx + 1),
);

// 參與者對照表
const conversationParticipants: Record<number, number[]> = {};
rawData.conversations.forEach((c) => {
  conversationParticipants[c.id] = c.participants.map((p) => p.userId);
});

// 輔助函數：取得對話列表資料
export function getConversationList(): ConversationListItem[] {
  return mockConversations
    .map((conv) => {
      const participantIds = conversationParticipants[conv.id] || [];
      const otherUserId = participantIds.find((id) => id !== CURRENT_USER_ID) ?? participantIds[0];
      const otherParticipant = mockUsers.find((u) => u.id === otherUserId) || mockUsers[0];

      const messages = mockMessages.filter((m) => m.conversationId === conv.id);
      const lastMessage =
        messages.length > 0
          ? messages.sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
            )[0]
          : null;

      return {
        conversation: conv,
        otherParticipant,
        lastMessage,
      };
    })
    .sort((a, b) => {
      const timeA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const timeB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return timeB - timeA;
    });
}

// 輔助函數：取得聊天室資料
export function getChatRoomData(conversationId: number): ChatRoomData | null {
  const conversation = mockConversations.find((c) => c.id === conversationId);
  if (!conversation) return null;

  const participantIds = conversationParticipants[conversationId] || [];
  const participants = mockUsers.filter((u) => participantIds.includes(u.id));

  const messages = mockMessages
    .filter((m) => m.conversationId === conversationId)
    .map((msg) => ({
      ...msg,
      reactions: mockReactions.filter((r) => r.messageId === msg.id),
    }))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return {
    conversation,
    participants,
    messages,
  };
}
