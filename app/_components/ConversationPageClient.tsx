"use client";

import { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import type { ConversationListItem } from "../types";
import ConversationList from "./ConversationList";
import NewConversationDialog from "./NewConversationDialog";

interface ConversationPageClientProps {
  conversations: ConversationListItem[];
}

export default function ConversationPageClient({
  conversations,
}: ConversationPageClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

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
