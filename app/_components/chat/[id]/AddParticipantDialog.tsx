"use client";

import { useState, useEffect } from "react";
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

interface AddParticipantDialogProps {
  open: boolean;
  onClose: () => void;
  conversationId: number;
  onParticipantAdded?: () => void;
}

export default function AddParticipantDialog({
  open,
  onClose,
  conversationId,
  onParticipantAdded,
}: AddParticipantDialogProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (open) {
      fetchAvailableUsers();
    }
  }, [open, conversationId]);

  const fetchAvailableUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/conversations/${conversationId}/available-users`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error("Failed to fetch available users");
      }
    } catch (error) {
      console.error("Error fetching available users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddParticipant = async (userId: number) => {
    setAdding(true);
    try {
      const response = await fetch(`/api/conversations/${conversationId}/participants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add participant");
      }

      onClose();
      if (onParticipantAdded) {
        onParticipantAdded();
      }
    } catch (error) {
      console.error("Error adding participant:", error);
      alert(error instanceof Error ? error.message : "添加參與者失敗，請重試");
    } finally {
      setAdding(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>添加參與者</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : users.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
            沒有可用的用戶可以添加
          </Typography>
        ) : (
          <List>
            {users.map((user) => (
              <ListItem key={user.id} disablePadding>
                <ListItemButton
                  onClick={() => handleAddParticipant(user.id)}
                  disabled={adding}
                  sx={{
                    "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
                    cursor: adding ? "wait" : "pointer",
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
