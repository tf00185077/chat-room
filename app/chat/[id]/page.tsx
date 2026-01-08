import { notFound } from "next/navigation";
import { getChatRoomData } from "../../../lib/db/getChatRoomData";
import { getCurrentUserId } from "../../../lib/getSession";
import ChatRoomClient from "../../_components/chat/[id]/ChatRoomClient";

export default async function ChatRoom({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const conversationId = Number(id);
  const currentUserId = await getCurrentUserId();

  const data = await getChatRoomData(conversationId);
  if (!data) {
    notFound();
  }

  const other = currentUserId
    ? data.participants.find((p) => p.id !== currentUserId)
    : data.participants[0];
  const baseMessages = data.messages;
  const otherParticipant = other ? { name: other.name, avatar: other.avatarUrl } : null;

  return (
    <ChatRoomClient
      conversationId={conversationId}
      baseMessages={baseMessages}
      otherParticipant={otherParticipant}
      currentUserId={currentUserId}
    />
  );
}
