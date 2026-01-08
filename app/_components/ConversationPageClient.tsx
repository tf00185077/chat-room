"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Box, Button, Typography, Alert } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import LoginIcon from "@mui/icons-material/Login";
import type { ConversationListItem } from "../types";
import ConversationList from "./ConversationList";
import NewConversationDialog from "./NewConversationDialog";

interface ConversationPageClientProps {
  conversations: ConversationListItem[];
}

export default function ConversationPageClient({
  conversations,
}: ConversationPageClientProps) {
  const { data: session, status } = useSession();
  const [dialogOpen, setDialogOpen] = useState(false);

  // 如果未登入，顯示提示訊息
  if (status === "loading") {
    return (
      <Box sx={{ maxWidth: 800, margin: "0 auto", padding: 2 }}>
        <Typography variant="body1">載入中...</Typography>
      </Box>
    );
  }

  if (!session) {
    return (
      <Box sx={{ maxWidth: 800, margin: "0 auto", padding: 2 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          請先登入以查看對話列表
        </Alert>
        <Typography variant="body1" color="text.secondary">
          點擊右上角的選單圖示來登入
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, margin: "0 auto", padding: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          對話列表
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          新對話
        </Button>
      </Box>
      <ConversationList conversations={conversations} />
      <NewConversationDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </Box>
  );
}
