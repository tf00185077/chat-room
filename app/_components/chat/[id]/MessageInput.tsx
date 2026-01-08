"use client";

import { Paper, TextField, IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

interface MessageInputProps {
  inputText: string;
  onInputChange: (text: string) => void;
  onSend: () => void;
}

export default function MessageInput({
  inputText,
  onInputChange,
  onSend,
}: MessageInputProps) {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        display: "flex",
        gap: 1,
        borderTop: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <TextField
        fullWidth
        placeholder="輸入訊息..."
        value={inputText}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
        multiline
        maxRows={4}
        size="small"
      />
      <IconButton
        color="primary"
        onClick={onSend}
        disabled={!inputText.trim()}
        sx={{ alignSelf: "flex-end" }}
      >
        <SendIcon />
      </IconButton>
    </Paper>
  );
}
