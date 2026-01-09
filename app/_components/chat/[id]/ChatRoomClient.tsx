"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Box } from "@mui/material";
import Pusher from "pusher-js";
import type { Message, MessageReaction, User } from "../../../types";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

interface ChatRoomClientProps {
  conversationId: number;
  baseMessages: (Message & { reactions: MessageReaction[]; senderName?: string; senderAvatar?: string })[];
  participants: User[];
  currentUserId: number | null;
}

export default function ChatRoomClient({
  conversationId,
  baseMessages,
  participants,
  currentUserId,
}: ChatRoomClientProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<(Message & { reactions: MessageReaction[]; senderName?: string; senderAvatar?: string })[]>(baseMessages);
  const [currentParticipants, setCurrentParticipants] = useState<User[]>(participants);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const pusherRef = useRef<Pusher | null>(null);
  const channelRef = useRef<ReturnType<Pusher["subscribe"]> | null>(null);

  // 初始化 Pusher 連接
  useEffect(() => {
    if (typeof window === "undefined") return;

    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap3";

    if (!pusherKey) {
      console.warn("Pusher key not configured");
      return;
    }

    const pusher = new Pusher(pusherKey, {
      cluster: pusherCluster,
    });

    pusherRef.current = pusher;

    const channelName = `conversation-${conversationId}`;
    const channel = pusher.subscribe(channelName);
    channelRef.current = channel;

    channel.bind("pusher:subscription_succeeded", () => {
      console.log(`Subscribed to ${channelName}`);
    });

    channel.bind("new-message", (message: Message & { reactions: MessageReaction[]; senderName?: string; senderAvatar?: string }) => {
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

    channel.bind("message-updated", (updatedMessage: Message & { reactions: MessageReaction[]; senderName?: string; senderAvatar?: string }) => {
      console.log("Received message update:", updatedMessage);
      setMessages((prev) =>
        prev.map((m) => (m.id === updatedMessage.id ? updatedMessage : m))
      );
    });

    channel.bind("participants-updated", (data: { participants: User[] }) => {
      console.log("Received participants update:", data);
      setCurrentParticipants(data.participants);
    });

    return () => {
      if (channel) {
        channel.unbind_all();
        pusher.unsubscribe(channelName);
      }
      pusher.disconnect();
    };
  }, [conversationId]);

  useEffect(() => {
    setMessages(baseMessages);
  }, [baseMessages]);

  useEffect(() => {
    setCurrentParticipants(participants);
  }, [participants]);

  const handleSend = async () => {
    const isAuthenticated = session?.user?.id;
    if (!inputText.trim() || isSending || !isAuthenticated || !currentUserId) return;

    const content = inputText.trim();
    setInputText("");
    await sendMessage(content, "text");
  };

  const handleImageSelect = async (base64: string) => {
    const isAuthenticated = session?.user?.id;
    if (isSending || !isAuthenticated || !currentUserId) return;

    await sendMessage(base64, "image");
  };

  const sendMessage = async (content: string, type: "text" | "image") => {
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
          type,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send message");
      }

      const newMessage = await response.json();
      
      // 如果 WebSocket 沒有收到訊息手動添加到狀態作為備用
      setTimeout(() => {
        setMessages((prev) => {
          if (!prev.some((m) => m.id === newMessage.id)) {
            console.log("Adding message manually (WebSocket fallback)");
            return [...prev, newMessage];
          }
          return prev;
        });
      }, 500); 
    } catch (error) {
      console.error("Error sending message:", error);
      if (type === "text") {
        setInputText(content);
      }
      alert(error instanceof Error ? error.message : "發送訊息失敗");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <ChatHeader 
        participants={currentParticipants} 
        conversationId={conversationId}
        currentUserId={currentUserId}
      />
      <MessageList messages={messages} currentUserId={currentUserId} />
      <MessageInput
        inputText={inputText}
        onInputChange={setInputText}
        onSend={handleSend}
        onImageSelect={handleImageSelect}
        isSending={isSending}
        disabled={!currentUserId}
      />
    </Box>
  );
}
