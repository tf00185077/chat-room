"use client";

import { useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
import type { Message, MessageReaction } from "../../../types";
import MessageBubble from "./MessageBubble";

interface MessageListProps {
  messages: (Message & { reactions: MessageReaction[]; senderName?: string; senderAvatar?: string })[];
  currentUserId: number | null;
}

export default function MessageList({ messages, currentUserId }: MessageListProps) {
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
      {messages.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            color: "text.secondary",
          }}
        >
          <Typography variant="body2">
            還沒有訊息，開始聊天吧！
          </Typography>
        </Box>
      ) : (
        <>
          {messages.map((msg) => {
            const isOwn = currentUserId !== null && msg.senderId === currentUserId;

            return (
              <MessageBubble
                key={msg.id}
                message={msg}
                reactions={msg.reactions}
                isOwn={isOwn}
                senderName={msg.senderName || "系統"}
                senderAvatar={msg.senderAvatar || ""}
              />
            );
          })}
          <div ref={messagesEndRef} />
        </>
      )}
    </Box>
  );
}
