import Pusher from "pusher";

// 初始化 Pusher 服務器實例（用於 API routes）
export function getPusherServer() {
  if (!process.env.PUSHER_APP_ID || !process.env.PUSHER_KEY || !process.env.PUSHER_SECRET) {
    console.warn("Pusher credentials not configured");
    return null;
  }

  return new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER || "ap3",
    useTLS: true,
  });
}
