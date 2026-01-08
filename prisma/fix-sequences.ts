import { prisma } from '../lib/prisma';

async function main() {
  console.log('重置 PostgreSQL 序列...');
  
  // 每個命令必須分開執行
  await prisma.$executeRawUnsafe(
    `SELECT setval('"Message_id_seq"', COALESCE((SELECT MAX(id) FROM "Message"), 1), true)`
  );
  await prisma.$executeRawUnsafe(
    `SELECT setval('"MessageReaction_id_seq"', COALESCE((SELECT MAX(id) FROM "MessageReaction"), 1), true)`
  );
  await prisma.$executeRawUnsafe(
    `SELECT setval('"User_id_seq"', COALESCE((SELECT MAX(id) FROM "User"), 1), true)`
  );
  await prisma.$executeRawUnsafe(
    `SELECT setval('"Conversation_id_seq"', COALESCE((SELECT MAX(id) FROM "Conversation"), 1), true)`
  );
  
  console.log('序列重置完成！');
}

main()
  .catch((e) => {
    console.error('重置序列時發生錯誤:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
