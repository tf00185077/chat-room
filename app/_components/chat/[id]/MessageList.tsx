"use client";

import { useEffect, useRef } from "react";
import { Box } from "@mui/material";
import type { Message, MessageReaction } from "../../../types";
import { CURRENT_USER_ID } from "../../../types";
import { mockUsers } from "../../../mockData";
import MessageBubble from "./MessageBubble";

interface MessageListProps {
  messages: (Message & { reactions: MessageReaction[] })[];
}

export default function MessageList({ messages }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Box
      sx={{
        flex: 1,
        overflowY: "auto",
        p: 2,
        backgroundColor: "grey.50",
      }}
    >
      {messages.map((msg) => {
        const sender = msg.senderId
          ? mockUsers.find((u) => u.id === msg.senderId)
          : null;
        const isOwn = msg.senderId === CURRENT_USER_ID;

        return (
          <MessageBubble
            key={msg.id}
            message={msg}
            reactions={msg.reactions}
            isOwn={isOwn}
            senderName={sender?.name || "系統"}
            senderAvatar={sender?.avatarUrl || ""}
          />
        );
      })}
      <div ref={messagesEndRef} />
    </Box>
  );
}
