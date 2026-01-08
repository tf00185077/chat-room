"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  CircularProgress,
  Box,
  Typography,
} from "@mui/material";

interface User {
  id: number;
  name: string;
  avatarUrl: string;
}

interface NewConversationDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function NewConversationDialog({
  open,
  onClose,
}: NewConversationDialogProps) {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConversation = async (otherUserId: number) => {
    setCreating(true);
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otherUserId }),
      });

      if (!response.ok) {
        throw new Error("Failed to create conversation");
      }

      const data = await response.json();
      onClose();
      router.push(`/chat/${data.id}`);
      router.refresh();
    } catch (error) {
      console.error("Error creating conversation:", error);
      alert("創建對話失敗，請重試");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>選擇要開始對話的用戶</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : users.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
            沒有可用的用戶
          </Typography>
        ) : (
          <List>
            {users.map((user) => (
              <ListItem key={user.id} disablePadding>
                <ListItemButton
                  onClick={() => handleCreateConversation(user.id)}
                  disabled={creating}
                  sx={{
                    "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
                    cursor: creating ? "wait" : "pointer",
                  }}
                >
                  <ListItemAvatar>
                    <Avatar src={user.avatarUrl} alt={user.name} />
                  </ListItemAvatar>
                  <ListItemText primary={user.name} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}
