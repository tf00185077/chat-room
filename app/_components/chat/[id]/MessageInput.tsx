"use client";

import { useRef } from "react";
import { Paper, TextField, IconButton, CircularProgress, Tooltip } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ImageIcon from "@mui/icons-material/Image";

interface MessageInputProps {
  inputText: string;
  onInputChange: (text: string) => void;
  onSend: () => void;
  onImageSelect?: (base64: string) => void;
  isSending?: boolean;
  disabled?: boolean;
}

export default function MessageInput({
  inputText,
  onInputChange,
  onSend,
  onImageSelect,
  isSending = false,
  disabled = false,
}: MessageInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  // 文字訊息需要 inputText，圖片訊息通過 onImageSelect 直接發送，不需要檢查 inputText
  const isDisabled = !inputText.trim() || isSending || disabled;

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImageSelect) return;

    // 重置 input，允許選擇同一檔案
    e.target.value = "";

    try {
      // 動態導入壓縮函數
      const { compressImageToBase64 } = await import("./imageUtils");
      const base64 = await compressImageToBase64(file);
      onImageSelect(base64);
    } catch (error) {
      alert(error instanceof Error ? error.message : "圖片處理失敗，請重試");
    }
  };

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
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        style={{ display: "none" }}
        onChange={handleImageChange}
        disabled={isSending || disabled}
      />
      {onImageSelect && (
        <Tooltip title="上傳圖片">
          <IconButton
            color="primary"
            onClick={handleImageClick}
            disabled={isSending || disabled}
            sx={{ alignSelf: "flex-end" }}
          >
            <ImageIcon />
          </IconButton>
        </Tooltip>
      )}
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
