"use client";

import { useState, useMemo } from "react";
import { Box } from "@mui/material";
import { CURRENT_USER_ID } from "../../../types";
import type { Message, MessageReaction } from "../../../types";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

interface ChatRoomClientProps {
  conversationId: number;
  baseMessages: (Message & { reactions: MessageReaction[] })[];
  otherParticipant: { name: string; avatar: string } | null;
}

export default function ChatRoomClient({
  conversationId,
  baseMessages,
  otherParticipant,
}: ChatRoomClientProps) {
  const [userMessages, setUserMessages] = useState<(Message & { reactions: MessageReaction[] })[]>([]);
  const [inputText, setInputText] = useState("");

  // Combine base messages with user-added messages
  const messages = useMemo(() => {
    return [...baseMessages, ...userMessages];
  }, [baseMessages, userMessages]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage: Message & { reactions: MessageReaction[] } = {
      id: Date.now(),
      conversationId,
      senderId: CURRENT_USER_ID,
      type: "text",
      content: inputText.trim(),
      createdAt: new Date().toISOString(),
      reactions: [],
    };

    setUserMessages((prev) => [...prev, newMessage]);
    setInputText("");
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
