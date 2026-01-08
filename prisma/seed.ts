import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 原始 JSON 資料
const rawData = {
  conversations: [
    {
      id: 1,
      participants: [
        { userId: 4, user: "David", avatar: "https://i.pravatar.cc/150?img=4" },
        { userId: 2, user: "Bob", avatar: "https://i.pravatar.cc/150?img=2" },
      ],
      lastMessage: "I'm building a new side project.",
      timestamp: 1739016600000,
    },
    {
      id: 2,
      participants: [
        { userId: 1, user: "Alice", avatar: "https://i.pravatar.cc/150?img=1" },
        { userId: 3, user: "Charlie", avatar: "https://i.pravatar.cc/150?img=3" },
      ],
      lastMessage: "What's your favorite editor?",
      timestamp: 1739017200000,
    },
  ],
  messages: [
    {
      conversationId: 1,
      userId: 4,
      user: "David",
      avatar: "https://i.pravatar.cc/150?img=4",
      messageType: "text",
      message: "Jest vs Cypress?",
      reactions: { like: 4, love: 2, laugh: 0 },
      timestamp: 1739016000000,
    },
    {
      conversationId: 1,
      userId: 2,
      user: "Bob",
      avatar: "https://i.pravatar.cc/150?img=2",
      messageType: "text",
      message: "Redux or Zustand?",
      reactions: { like: 5, love: 3, laugh: 0 },
      timestamp: 1739016060000,
    },
    {
      conversationId: 1,
      userId: 2,
      user: "Bob",
      avatar: "https://i.pravatar.cc/150?img=2",
      messageType: "text",
      message: "Jest vs Cypress?",
      reactions: { like: 0, love: 0, laugh: 0 },
      timestamp: 1739016120000,
    },
    {
      conversationId: 1,
      userId: 4,
      user: "David",
      avatar: "https://i.pravatar.cc/150?img=4",
      messageType: "text",
      message: "How's it going?",
      reactions: { like: 4, love: 1, laugh: 1 },
      timestamp: 1739016180000,
    },
  ],
};

async function main() {
  console.log('開始匯入資料...');

  // 1. 建立 Users
  const userMap = new Map<number, { id: number; name: string; avatarUrl: string }>();
  
  rawData.conversations.forEach((conv) => {
    conv.participants.forEach((p) => {
      if (!userMap.has(p.userId)) {
        userMap.set(p.userId, { id: p.userId, name: p.user, avatarUrl: p.avatar });
      }
    });
  });
  
  rawData.messages.forEach((msg) => {
    if (!userMap.has(msg.userId)) {
      userMap.set(msg.userId, { id: msg.userId, name: msg.user, avatarUrl: msg.avatar });
    }
  });

  console.log(`建立 ${userMap.size} 個使用者...`);
  for (const user of userMap.values()) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: user,
      create: user,
    });
  }

  // 2. 建立 Conversations
  console.log('建立對話...');
  for (const conv of rawData.conversations) {
    await prisma.conversation.upsert({
      where: { id: conv.id },
      update: {
        createdAt: new Date(conv.timestamp),
      },
      create: {
        id: conv.id,
        createdAt: new Date(conv.timestamp),
      },
    });

    // 建立參與者關係
    for (const participant of conv.participants) {
      await prisma.conversationParticipant.upsert({
        where: {
          conversationId_userId: {
            conversationId: conv.id,
            userId: participant.userId,
          },
        },
        update: {},
        create: {
          conversationId: conv.id,
          userId: participant.userId,
          joinedAt: new Date(conv.timestamp),
        },
      });
    }
  }

  // 3. 建立 Messages 和 Reactions
  console.log('建立訊息和反應...');
  for (let idx = 0; idx < rawData.messages.length; idx++) {
    const msg = rawData.messages[idx];
    const messageId = idx + 1;

    // 建立訊息
    await prisma.message.upsert({
      where: { id: messageId },
      update: {
        conversationId: msg.conversationId,
        senderId: msg.userId,
        type: msg.messageType === "text" ? "text" : "system",
        content: msg.message,
        createdAt: new Date(msg.timestamp),
      },
      create: {
        id: messageId,
        conversationId: msg.conversationId,
        senderId: msg.userId,
        type: msg.messageType === "text" ? "text" : "system",
        content: msg.message,
        createdAt: new Date(msg.timestamp),
      },
    });

    // 建立 Reactions（使用虛擬 userId 來表示數量）
    // 先確保虛擬用戶存在
    const virtualUserIdBase = 1000000;
    let reactionId = messageId * 1000; // 確定性 ID
    const reactions = msg.reactions;
    
    // 收集所有需要的虛擬用戶 ID
    const virtualUserIds = new Set<number>();
    let tempReactionId = messageId * 1000;
    for (const [, count] of Object.entries(reactions) as [("like" | "love" | "laugh"), number][]) {
      for (let i = 0; i < count; i++) {
        virtualUserIds.add(virtualUserIdBase + tempReactionId);
        tempReactionId++;
      }
    }
    
    // 確保所有虛擬用戶存在
    for (const virtualUserId of virtualUserIds) {
      await prisma.user.upsert({
        where: { id: virtualUserId },
        update: {},
        create: {
          id: virtualUserId,
          name: `Virtual User ${virtualUserId}`,
          avatarUrl: '',
        },
      });
    }
    
    // 重新計算 reactionId 並建立 reactions
    reactionId = messageId * 1000;
    for (const [type, count] of Object.entries(reactions) as [("like" | "love" | "laugh"), number][]) {
      for (let i = 0; i < count; i++) {
        const userId = virtualUserIdBase + reactionId;
        await prisma.messageReaction.upsert({
          where: {
            messageId_userId_type: {
              messageId,
              userId,
              type,
            },
          },
          update: {},
          create: {
            messageId,
            userId,
            type,
            createdAt: new Date(msg.timestamp),
          },
        });
        reactionId++;
      }
    }
  }

  console.log('資料匯入完成！');
}

main()
  .catch((e) => {
    console.error('匯入資料時發生錯誤:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
