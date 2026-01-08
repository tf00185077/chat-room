// 核心資料型別定義 - 對應未來 MySQL schema

export const CURRENT_USER_ID = 1;

export interface User {
  id: number;
  name: string;
  avatarUrl: string;
}

export interface Conversation {
  id: number;
  createdAt: string;
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: number | null; // null 表示系統訊息
  type: "text" | "system";
  content: string;
  createdAt: string;
}

export interface MessageReaction {
  id: number;
  messageId: number;
  userId: number;
  type: "like" | "love" | "laugh";
}

// UI 用的組合型別
export interface ConversationListItem {
  conversation: Conversation;
  otherParticipant: User; // 除了目前使用者外的參與者
  lastMessage: Message | null;
}

export interface ChatRoomData {
  conversation: Conversation;
  participants: User[];
  messages: (Message & { reactions: MessageReaction[] })[];
}
