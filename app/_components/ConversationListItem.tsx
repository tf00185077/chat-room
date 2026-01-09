"use client";

import Link from "next/link";
import {
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
} from "@mui/material";
import type { ConversationListItem } from "../types";
import { formatTime } from "./utils";

interface ConversationListItemProps {
  item: ConversationListItem;
}

export default function ConversationListItem({ item }: ConversationListItemProps) {
  const timeDisplay = item.lastMessage ? formatTime(item.lastMessage.createdAt) : "";

  return (
    <Link
      href={`/chat/${item.conversation.id}`}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <ListItem
        sx={{
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
          cursor: "pointer",
        }}
      >
        <ListItemAvatar>
          <Avatar src={item.otherParticipant.avatarUrl} alt={item.otherParticipant.name} />
        </ListItemAvatar>
        <ListItemText
          primary={item.otherParticipant.name}
          secondary={
            <>
              <Typography
                component="span"
                variant="body2"
                color="text.secondary"
                sx={{
                  display: "block",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "100%",
                }}
              >
                {item.lastMessage
                  ? item.lastMessage.type === "system"
                    ? `[系統] ${item.lastMessage.content}`
                    : item.lastMessage.type === "image"
                    ? "[圖片]"
                    : item.lastMessage.content
                  : "尚無訊息"}
              </Typography>
              {item.lastMessage && (
                <Typography
                  component="span"
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block" }}
                  suppressHydrationWarning
                >
                  {timeDisplay}
                </Typography>
              )}
            </>
          }
        />
      </ListItem>
    </Link>
  );
}
