"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  TextField,
  IconButton,
  Chip,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import FavoriteIcon from "@mui/icons-material/Favorite";
import MoodIcon from "@mui/icons-material/Mood";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { getChatRoomData, mockUsers } from "../../mockData";
import { CURRENT_USER_ID } from "../../types";
import type { Message, MessageReaction } from "../../types";

function formatMessageTime(dateString: string): string {
  const date = new Date(dateString);
  // 使用固定格式避免 hydration 錯誤（不依賴 locale）
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function MessageBubble({
  message,
  reactions,
  isOwn,
  senderName,
  senderAvatar,
}: {
  message: Message;
  reactions: MessageReaction[];
  isOwn: boolean;
  senderName: string;
  senderAvatar: string;
}) {
  const [localReactions, setLocalReactions] = useState(reactions);

  const toggleReaction = (type: "like" | "love" | "laugh") => {
    setLocalReactions((prev) => {
      const existing = prev.find((r) => r.userId === CURRENT_USER_ID && r.type === type);
      if (existing) {
        return prev.filter((r) => r.id !== existing.id);
      } else {
        return [
          ...prev.filter((r) => !(r.userId === CURRENT_USER_ID && r.type === type)),
          {
            id: Date.now(),
            messageId: message.id,
            userId: CURRENT_USER_ID,
            type,
          },
        ];
      }
    });
  }

  const reactionCounts = {
    like: localReactions.filter((r) => r.type === "like").length,
    love: localReactions.filter((r) => r.type === "love").length,
    laugh: localReactions.filter((r) => r.type === "laugh").length,
  };

  if (message.type === "system") {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 1 }}>
        <Typography variant="caption" color="text.secondary">
          {message.content}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isOwn ? "flex-end" : "flex-start",
        mb: 2,
      }}
    >
      <Box
        sx={{
          maxWidth: "70%",
          display: "flex",
          flexDirection: isOwn ? "row-reverse" : "row",
          gap: 1,
        }}
      >
        <Avatar src={senderAvatar} alt={senderName} sx={{ width: 32, height: 32 }} />
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 0.5,
              flexDirection: isOwn ? "row-reverse" : "row",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {senderName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatMessageTime(message.createdAt)}
            </Typography>
          </Box>
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              backgroundColor: isOwn ? "primary.light" : "grey.100",
              color: isOwn ? "primary.contrastText" : "text.primary",
            }}
          >
            <Typography variant="body1">{message.content}</Typography>
          </Paper>
          {(reactionCounts.like > 0 || reactionCounts.love > 0 || reactionCounts.laugh > 0) && (
            <Box
              sx={{
                display: "flex",
                gap: 0.5,
                mt: 0.5,
                flexDirection: isOwn ? "row-reverse" : "row",
              }}
            >
              {reactionCounts.like > 0 && (
                <Chip
                  size="small"
                  icon={<ThumbUpIcon sx={{ fontSize: 14 }} />}
                  label={reactionCounts.like}
                  sx={{ height: 20, fontSize: "0.7rem" }}
                />
              )}
              {reactionCounts.love > 0 && (
                <Chip
                  size="small"
                  icon={<FavoriteIcon sx={{ fontSize: 14 }} />}
                  label={reactionCounts.love}
                  sx={{ height: 20, fontSize: "0.7rem" }}
                />
              )}
              {reactionCounts.laugh > 0 && (
                <Chip
                  size="small"
                  icon={<MoodIcon sx={{ fontSize: 14 }} />}
                  label={reactionCounts.laugh}
                  sx={{ height: 20, fontSize: "0.7rem" }}
                />
              )}
            </Box>
          )}
          <Box
            sx={{
              display: "flex",
              gap: 0.5,
              mt: 0.5,
              flexDirection: isOwn ? "row-reverse" : "row",
            }}
          >
            <IconButton
              size="small"
              onClick={() => toggleReaction("like")}
              sx={{ width: 24, height: 24 }}
            >
              <ThumbUpIcon sx={{ fontSize: 16 }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => toggleReaction("love")}
              sx={{ width: 24, height: 24 }}
            >
              <FavoriteIcon sx={{ fontSize: 16 }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => toggleReaction("laugh")}
              sx={{ width: 24, height: 24 }}
            >
              <MoodIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default function ChatRoom() {
  const params = useParams();
  const router = useRouter();
  const conversationId = Number(params.id);
  
  // Compute base data from mock data
  const baseData = useMemo(() => {
    const data = getChatRoomData(conversationId);
    if (!data) return null;
    const other = data.participants.find((p) => p.id !== CURRENT_USER_ID);
    return {
      messages: data.messages,
      otherParticipant: other ? { name: other.name, avatar: other.avatarUrl } : null,
    };
  }, [conversationId]);

  // State for user-added messages (new messages sent in this session)
  // Note: When conversationId changes, Next.js will remount the component, so this will reset automatically
  const [userMessages, setUserMessages] = useState<(Message & { reactions: MessageReaction[] })[]>([]);

  // Handle invalid conversationId
  useEffect(() => {
    if (!baseData) {
      router.push("/");
    }
  }, [baseData, router]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Combine base messages with user-added messages
  const messages = useMemo(() => {
    if (!baseData) return [];
    return [...baseData.messages, ...userMessages];
  }, [baseData, userMessages]);

  const otherParticipant = baseData?.otherParticipant ?? null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      <Paper
        elevation={1}
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
          borderBottom: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <IconButton onClick={() => router.push("/")}>
          <ArrowBackIcon />
        </IconButton>
        {otherParticipant && (
          <>
            <Avatar src={otherParticipant.avatar} alt={otherParticipant.name} />
            <Typography variant="h6">{otherParticipant.name}</Typography>
          </>
        )}
      </Paper>

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

      <Paper
        elevation={2}
        sx={{
          p: 2,
          display: "flex",
          gap: 1,
          borderTop: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <TextField
          fullWidth
          placeholder="輸入訊息..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          multiline
          maxRows={4}
          size="small"
        />
        <IconButton
          color="primary"
          onClick={handleSend}
          disabled={!inputText.trim()}
          sx={{ alignSelf: "flex-end" }}
        >
          <SendIcon />
        </IconButton>
      </Paper>
    </Box>
  );
}
