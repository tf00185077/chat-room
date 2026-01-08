"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Avatar,
} from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import FavoriteIcon from "@mui/icons-material/Favorite";
import MoodIcon from "@mui/icons-material/Mood";
import type { Message, MessageReaction } from "../../../types";
import { formatMessageTime } from "./utils";
import ReactionButton from "./ReactionButton";

interface MessageBubbleProps {
  message: Message;
  reactions: MessageReaction[];
  isOwn: boolean;
  senderName: string;
  senderAvatar: string;
}

export default function MessageBubble({
  message,
  reactions,
  isOwn,
  senderName,
  senderAvatar,
}: MessageBubbleProps) {
  const [localReactions, setLocalReactions] = useState(reactions);
  const [isToggling, setIsToggling] = useState(false);

  // 當 reactions prop 更新時，同步本地狀態
  useEffect(() => {
    setLocalReactions(reactions);
  }, [reactions]);

  const toggleReaction = async (type: "like" | "love" | "laugh") => {
    if (isToggling) return;

    setIsToggling(true);
    try {
      const response = await fetch(`/api/messages/${message.id}/reactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle reaction");
      }

      // 反應更新會通過 WebSocket 廣播，不需要手動更新
      // 但我們仍然更新本地狀態以提供即時反饋
      const data = await response.json();
      setLocalReactions(data.reactions);
    } catch (error) {
      console.error("Error toggling reaction:", error);
    } finally {
      setIsToggling(false);
    }
  };

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
          <Box
            sx={{
              display: "flex",
              gap: 0.5,
              mt: 0.5,
              flexDirection: isOwn ? "row-reverse" : "row",
              alignItems: "center",
            }}
          >
            <ReactionButton
              icon={<ThumbUpIcon sx={{ fontSize: 16 }} />}
              count={reactionCounts.like}
              onClick={() => toggleReaction("like")}
            />
            <ReactionButton
              icon={<FavoriteIcon sx={{ fontSize: 16 }} />}
              count={reactionCounts.love}
              onClick={() => toggleReaction("love")}
            />
            <ReactionButton
              icon={<MoodIcon sx={{ fontSize: 16 }} />}
              count={reactionCounts.laugh}
              onClick={() => toggleReaction("laugh")}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
