"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

interface DeleteConversationDialogProps {
  open: boolean;
  onClose: () => void;
  conversationId: number;
  onDeleted: () => void;
}

export default function DeleteConversationDialog({
  open,
  onClose,
  conversationId,
  onDeleted,
}: DeleteConversationDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "刪除失敗");
      }

      onDeleted();
    } catch (error) {
      console.error("Error deleting conversation:", error);
      alert(error instanceof Error ? error.message : "刪除聊天室失敗，請重試");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>刪除聊天室</DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          確定要刪除這個聊天室嗎？
        </Typography>
        <Typography variant="body2" color="text.secondary">
          此操作無法復原，所有對話內容（包括圖片）都將被永久刪除。
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isDeleting}>
          取消
        </Button>
        <Button
          onClick={handleDelete}
          color="error"
          variant="contained"
          startIcon={
            isDeleting ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <DeleteIcon />
            )
          }
          disabled={isDeleting}
        >
          {isDeleting ? "刪除中..." : "刪除"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
