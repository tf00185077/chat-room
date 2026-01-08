import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('開始清空資料庫資料...');

  // 按照外鍵依賴順序刪除資料
  // 1. 刪除 MessageReaction（依賴 Message 和 User）
  console.log('刪除訊息反應...');
  await prisma.messageReaction.deleteMany({});
  console.log('✓ 訊息反應已刪除');

  // 2. 刪除 Message（依賴 Conversation 和 User）
  console.log('刪除訊息...');
  await prisma.message.deleteMany({});
  console.log('✓ 訊息已刪除');

  // 3. 刪除 ConversationParticipant（依賴 Conversation 和 User）
  console.log('刪除對話參與者...');
  await prisma.conversationParticipant.deleteMany({});
  console.log('✓ 對話參與者已刪除');

  // 4. 刪除 Conversation
  console.log('刪除對話...');
  await prisma.conversation.deleteMany({});
  console.log('✓ 對話已刪除');

  // 5. 刪除 User（最後刪除，因為其他表都依賴它）
  console.log('刪除用戶...');
  await prisma.user.deleteMany({});
  console.log('✓ 用戶已刪除');

  // 重置序列
  console.log('重置序列...');
  await prisma.$executeRawUnsafe(
    `SELECT setval('"Message_id_seq"', 1, false)`
  );
  await prisma.$executeRawUnsafe(
    `SELECT setval('"MessageReaction_id_seq"', 1, false)`
  );
  await prisma.$executeRawUnsafe(
    `SELECT setval('"User_id_seq"', 1, false)`
  );
  await prisma.$executeRawUnsafe(
    `SELECT setval('"Conversation_id_seq"', 1, false)`
  );
  await prisma.$executeRawUnsafe(
    `SELECT setval('"ConversationParticipant_id_seq"', 1, false)`
  );
  console.log('✓ 序列已重置');

  console.log('資料庫資料已全部清空！');
}

main()
  .catch((e) => {
    console.error('清空資料時發生錯誤:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
