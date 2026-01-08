import { notFound } from "next/navigation";
import { getChatRoomData } from "../../../lib/db";
import { CURRENT_USER_ID } from "../../types";
import ChatRoomClient from "../../_components/chat/[id]/ChatRoomClient";

export default async function ChatRoom({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const conversationId = Number(id);

  const data = await getChatRoomData(conversationId);
  if (!data) {
    notFound();
  }

  const other = data.participants.find((p) => p.id !== CURRENT_USER_ID);
  const baseMessages = data.messages;
  const otherParticipant = other ? { name: other.name, avatar: other.avatarUrl } : null;

  return (
    <ChatRoomClient
      conversationId={conversationId}
      baseMessages={baseMessages}
      otherParticipant={otherParticipant}
    />
  );
}
