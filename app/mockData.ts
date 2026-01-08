import { User, Conversation, Message, MessageReaction, ConversationListItem, ChatRoomData } from "./types";
import { CURRENT_USER_ID } from "./types";

// 假資料：使用者
export const mockUsers: User[] = [
  { id: 1, name: "我", avatarUrl: "https://i.pravatar.cc/150?img=1" },
  { id: 2, name: "張三", avatarUrl: "https://i.pravatar.cc/150?img=2" },
  { id: 3, name: "李四", avatarUrl: "https://i.pravatar.cc/150?img=3" },
  { id: 4, name: "王五", avatarUrl: "https://i.pravatar.cc/150?img=4" },
];

// 假資料：對話
export const mockConversations: Conversation[] = [
  { id: 1, createdAt: "2024-01-15T10:00:00Z" },
  { id: 2, createdAt: "2024-01-16T14:30:00Z" },
  { id: 3, createdAt: "2024-01-17T09:15:00Z" },
];

// 假資料：訊息
export const mockMessages: Message[] = [
  { id: 1, conversationId: 1, senderId: 2, type: "text", content: "你好！", createdAt: "2024-01-15T10:00:00Z" },
  { id: 2, conversationId: 1, senderId: CURRENT_USER_ID, type: "text", content: "嗨，最近如何？", createdAt: "2024-01-15T10:05:00Z" },
  { id: 3, conversationId: 1, senderId: 2, type: "text", content: "還不錯，你呢？", createdAt: "2024-01-15T10:10:00Z" },
  { id: 4, conversationId: 1, senderId: CURRENT_USER_ID, type: "text", content: "我也很好，謝謝！", createdAt: "2024-01-15T10:15:00Z" },
  { id: 5, conversationId: 1, senderId: null, type: "system", content: "張三已加入對話", createdAt: "2024-01-15T10:20:00Z" },
  
  { id: 6, conversationId: 2, senderId: 3, type: "text", content: "明天開會記得帶資料", createdAt: "2024-01-16T14:30:00Z" },
  { id: 7, conversationId: 2, senderId: CURRENT_USER_ID, type: "text", content: "好的，我會準備", createdAt: "2024-01-16T14:35:00Z" },
  
  { id: 8, conversationId: 3, senderId: 4, type: "text", content: "專案進度如何？", createdAt: "2024-01-17T09:15:00Z" },
];

// 假資料：反應
export const mockReactions: MessageReaction[] = [
  { id: 1, messageId: 2, userId: 2, type: "like" },
  { id: 2, messageId: 3, userId: CURRENT_USER_ID, type: "love" },
  { id: 3, messageId: 4, userId: 2, type: "laugh" },
];

// 輔助函數：取得對話列表資料
export function getConversationList(): ConversationListItem[] {
  const conversationParticipants: Record<number, number> = {
    1: 2, // conversation 1 的對方是 user 2
    2: 3, // conversation 2 的對方是 user 3
    3: 4, // conversation 3 的對方是 user 4
  };

  return mockConversations.map((conv) => {
    const otherUserId = conversationParticipants[conv.id];
    const otherParticipant = mockUsers.find((u) => u.id === otherUserId)!;
    
    // 找出該對話的最後一則訊息
    const messages = mockMessages.filter((m) => m.conversationId === conv.id);
    const lastMessage = messages.length > 0 
      ? messages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
      : null;

    return {
      conversation: conv,
      otherParticipant,
      lastMessage,
    };
  }).sort((a, b) => {
    // 依最後訊息時間排序
    const timeA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
    const timeB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
    return timeB - timeA;
  });
}

// 輔助函數：取得聊天室資料
export function getChatRoomData(conversationId: number): ChatRoomData | null {
  const conversation = mockConversations.find((c) => c.id === conversationId);
  if (!conversation) return null;

  // 找出參與者（簡化：假設每個對話只有兩個參與者）
  const conversationParticipants: Record<number, number[]> = {
    1: [1, 2],
    2: [1, 3],
    3: [1, 4],
  };
  const participantIds = conversationParticipants[conversationId] || [];
  const participants = mockUsers.filter((u) => participantIds.includes(u.id));

  // 找出該對話的所有訊息，並附上 reactions
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
