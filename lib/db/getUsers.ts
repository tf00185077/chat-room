import { prisma } from '../prisma';
import { getCurrentUserId } from '../getSession';

export async function getUsers() {
  const currentUserId = await getCurrentUserId();
  
  const users = await prisma.user.findMany({
    orderBy: {
      name: 'asc',
    },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
    },
  });

  // 過濾掉當前用戶
  return users.filter((user) => user.id !== currentUserId);
}
