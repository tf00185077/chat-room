import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";

// 使用 global 對象確保在所有模組實例間共享
declare global {
  var io: SocketIOServer | undefined;
}

export function initializeSocket(server: HTTPServer) {
  if (global.io) {
    return global.io;
  }

  global.io = new SocketIOServer(server, {
    path: "/api/socket/io",
    addTrailingSlash: false,
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  global.io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // 加入聊天室
    socket.on("join-room", (conversationId: number) => {
      const roomName = `conversation-${conversationId}`;
      socket.join(roomName);
      console.log(`Client ${socket.id} joined ${roomName}`);
      // 獲取房間中的客戶端數量
      const room = global.io?.sockets.adapter.rooms.get(roomName);
      console.log(`Room ${roomName} now has ${room?.size || 0} clients`);
    });

    // 離開聊天室
    socket.on("leave-room", (conversationId: number) => {
      const roomName = `conversation-${conversationId}`;
      socket.leave(roomName);
      console.log(`Client ${socket.id} left ${roomName}`);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return global.io;
}

export function getSocketIO(): SocketIOServer | null {
  return global.io || null;
}
