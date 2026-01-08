"use client";

import { useRouter } from "next/navigation";
import { Paper, Avatar, Typography, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface ChatHeaderProps {
  otherParticipant: { name: string; avatar: string } | null;
}

export default function ChatHeader({ otherParticipant }: ChatHeaderProps) {
  const router = useRouter();

  return (
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
  );
}
