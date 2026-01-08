"use client";

import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  IconButton,
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
          <Box
            sx={{
              display: "flex",
              gap: 0.5,
              mt: 0.5,
              flexDirection: isOwn ? "row-reverse" : "row",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.25,
              }}
            >
              <IconButton
                size="small"
                onClick={() => toggleReaction("like")}
                sx={{ width: 24, height: 24, padding: 0.5 }}
              >
                <ThumbUpIcon sx={{ fontSize: 16 }} />
              </IconButton>
              
              {reactionCounts.like > 0 && (
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: "0.75rem",
                    minWidth: "1ch",
                    textAlign: "center",
                  }}
                >
                  {reactionCounts.like}
                </Typography>
              )}
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.25,
              }}
            >
              <IconButton
                size="small"
                onClick={() => toggleReaction("love")}
                sx={{ width: 24, height: 24, padding: 0.5 }}
              >
                <FavoriteIcon sx={{ fontSize: 16 }} />
              </IconButton>
              {reactionCounts.love > 0 && (
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: "0.75rem",
                    minWidth: "1ch",
                    textAlign: "center",
                  }}
                >
                  {reactionCounts.love}
                </Typography>
              )}
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.25,
              }}
            >
              <IconButton
                size="small"
                onClick={() => toggleReaction("laugh")}
                sx={{ width: 24, height: 24, padding: 0.5 }}
              >
                <MoodIcon sx={{ fontSize: 16 }} />
              </IconButton>
              {reactionCounts.laugh > 0 && (
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: "0.75rem",
                    minWidth: "1ch",
                    textAlign: "center",
                  }}
                >
                  {reactionCounts.laugh}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
