"use client";

import { Paper, TextField, IconButton, CircularProgress } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

interface MessageInputProps {
  inputText: string;
  onInputChange: (text: string) => void;
  onSend: () => void;
  isSending?: boolean;
  disabled?: boolean;
}

export default function MessageInput({
  inputText,
  onInputChange,
  onSend,
  isSending = false,
  disabled = false,
}: MessageInputProps) {
  const isDisabled = !inputText.trim() || isSending || disabled;

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
          if (e.key === "Enter" && !e.shiftKey && !isDisabled) {
            e.preventDefault();
            onSend();
          }
        }}
        multiline
        maxRows={4}
        size="small"
        disabled={isSending || disabled}
      />
      <IconButton
        color="primary"
        onClick={onSend}
        disabled={isDisabled}
        sx={{ alignSelf: "flex-end" }}
      >
        {isSending ? (
          <CircularProgress size={20} color="inherit" />
        ) : (
          <SendIcon />
        )}
      </IconButton>
    </Paper>
  );
}
