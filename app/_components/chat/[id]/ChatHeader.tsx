"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Paper, Avatar, Typography, IconButton, Box, Chip } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import type { User } from "../../../types";
import AddParticipantDialog from "./AddParticipantDialog";

interface ChatHeaderProps {
  participants: User[];
  conversationId: number;
  currentUserId: number | null;
}

export default function ChatHeader({ participants, conversationId, currentUserId }: ChatHeaderProps) {
  const router = useRouter();
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // 排除當前用戶，顯示其他參與者
  const otherParticipants = participants.filter((p) => p.id !== currentUserId);

  return (
    <>
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
        
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1, overflowX: "auto" }}>
          {otherParticipants.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              只有你一人
            </Typography>
          ) : (
            otherParticipants.map((participant) => (
              <Chip
                key={participant.id}
                avatar={<Avatar src={participant.avatarUrl} alt={participant.name} />}
                label={participant.name}
                variant="outlined"
                size="small"
              />
            ))
          )}
        </Box>

        <IconButton
          onClick={() => setAddDialogOpen(true)}
          color="primary"
          title="添加參與者"
        >
          <PersonAddIcon />
        </IconButton>
      </Paper>

      <AddParticipantDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        conversationId={conversationId}
        onParticipantAdded={() => setAddDialogOpen(false)}
      />
    </>
  );
}
