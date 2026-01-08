"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Box } from "@mui/material";
import { io, Socket } from "socket.io-client";
import type { Message, MessageReaction } from "../../../types";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

interface ChatRoomClientProps {
  conversationId: number;
  baseMessages: (Message & { reactions: MessageReaction[]; senderName?: string; senderAvatar?: string })[];
  otherParticipant: { name: string; avatar: string } | null;
  currentUserId: number | null;
}

export default function ChatRoomClient({
  conversationId,
  baseMessages,
  otherParticipant,
  currentUserId,
}: ChatRoomClientProps) {
  const { data: session } = useSession(); // 保留用於發送訊息時檢查，但不用于 UI 判斷
  const [messages, setMessages] = useState<(Message & { reactions: MessageReaction[]; senderName?: string; senderAvatar?: string })[]>(baseMessages);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // 初始化 WebSocket 連接
  useEffect(() => {
    // 只在客戶端連接
    if (typeof window === "undefined") return;

    const socket = io({
      path: "/api/socket/io",
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      // 連接成功後加入聊天室
      socket.emit("join-room", conversationId);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    // 監聽新訊息
    socket.on("new-message", (message: Message & { reactions: MessageReaction[]; senderName?: string; senderAvatar?: string }) => {
      console.log("Received new message:", message);
      setMessages((prev) => {
        // 避免重複添加
        if (prev.some((m) => m.id === message.id)) {
          console.log("Message already exists, skipping:", message.id);
          return prev;
        }
        console.log("Adding new message to state");
        return [...prev, message];
      });
    });

    // 監聽訊息更新（反應變化）
    socket.on("message-updated", (updatedMessage: Message & { reactions: MessageReaction[]; senderName?: string; senderAvatar?: string }) => {
      console.log("Received message update:", updatedMessage);
      setMessages((prev) =>
        prev.map((m) => (m.id === updatedMessage.id ? updatedMessage : m))
      );
    });

    // 清理函數
    return () => {
      if (socket.connected) {
        socket.emit("leave-room", conversationId);
      }
      socket.disconnect();
    };
  }, [conversationId]);

  // 當 baseMessages 變化時更新
  useEffect(() => {
    setMessages(baseMessages);
  }, [baseMessages]);

  const handleSend = async () => {
    // 使用 session 檢查是否已登入（用於功能檢查）
    const isAuthenticated = session?.user?.id;
    if (!inputText.trim() || isSending || !isAuthenticated || !currentUserId) return;

    const content = inputText.trim();
    setInputText("");
    setIsSending(true);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId,
          content,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const newMessage = await response.json();
      console.log("Message sent, response:", newMessage);
      
      // 如果 WebSocket 沒有收到訊息（例如連接失敗），手動添加到狀態作為備用
      setTimeout(() => {
        setMessages((prev) => {
          if (!prev.some((m) => m.id === newMessage.id)) {
            console.log("Adding message manually (WebSocket fallback)");
            return [...prev, newMessage];
          }
          return prev;
        });
      }, 500); // 等待 500ms，如果 WebSocket 沒有收到則手動添加
    } catch (error) {
      console.error("Error sending message:", error);
      setInputText(content); // 恢復輸入內容
      alert("發送訊息失敗，請重試");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <ChatHeader otherParticipant={otherParticipant} />
      <MessageList messages={messages} currentUserId={currentUserId} />
      <MessageInput
        inputText={inputText}
        onInputChange={setInputText}
        onSend={handleSend}
      />
    </Box>
  );
}
