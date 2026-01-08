"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Box } from "@mui/material";
import { CURRENT_USER_ID } from "../../../types";
import type { Message, MessageReaction } from "../../../types";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

interface ChatRoomClientProps {
  conversationId: number;
  baseMessages: (Message & { reactions: MessageReaction[]; senderName?: string; senderAvatar?: string })[];
  otherParticipant: { name: string; avatar: string } | null;
}

export default function ChatRoomClient({
  conversationId,
  baseMessages,
  otherParticipant,
}: ChatRoomClientProps) {
  const router = useRouter();
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [optimisticMessages, setOptimisticMessages] = useState<(Message & { reactions: MessageReaction[]; senderName?: string; senderAvatar?: string })[]>([]);

  // Combine base messages with optimistic updates
  const messages = useMemo(() => {
    return [...baseMessages, ...optimisticMessages];
  }, [baseMessages, optimisticMessages]);

  const handleSend = async () => {
    if (!inputText.trim() || isSending) return;

    const content = inputText.trim();
    setInputText("");
    setIsSending(true);

    // Optimistic update: 立即顯示訊息
    const tempMessage: Message & { reactions: MessageReaction[]; senderName?: string; senderAvatar?: string } = {
      id: Date.now(), // 臨時 ID
      conversationId,
      senderId: CURRENT_USER_ID,
      type: "text",
      content,
      createdAt: new Date().toISOString(),
      reactions: [],
      senderName: "我",
      senderAvatar: "",
    };

    setOptimisticMessages((prev) => [...prev, tempMessage]);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId,
          content,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const newMessage = await response.json();
      
      // 移除臨時訊息，用真實訊息替換
      setOptimisticMessages((prev) => 
        prev.filter((m) => m.id !== tempMessage.id)
      );

      // 刷新頁面以獲取最新訊息（包含真實 ID）
      router.refresh();
    } catch (error) {
      console.error("Error sending message:", error);
      // 移除失敗的 optimistic message
      setOptimisticMessages((prev) => 
        prev.filter((m) => m.id !== tempMessage.id)
      );
      setInputText(content); // 恢復輸入內容
      alert("發送訊息失敗，請重試");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <ChatHeader otherParticipant={otherParticipant} />
      <MessageList messages={messages} />
      <MessageInput
        inputText={inputText}
        onInputChange={setInputText}
        onSend={handleSend}
      />
    </Box>
  );
}
