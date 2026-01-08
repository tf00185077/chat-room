"use client";

import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  IconButton,
  Chip,
} from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import FavoriteIcon from "@mui/icons-material/Favorite";
import MoodIcon from "@mui/icons-material/Mood";
import type { Message, MessageReaction } from "../../../types";
import { CURRENT_USER_ID } from "../../../types";
import { formatMessageTime } from "./utils";

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
