import { auth } from "./auth";

export async function getCurrentUserId(): Promise<number | null> {
  const session = await auth();
  return session?.user?.id ? Number(session.user.id) : null;
}
