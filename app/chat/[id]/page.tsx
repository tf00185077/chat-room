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

  const baseMessages = data.messages;
  const participants = data.participants;

  return (
    <ChatRoomClient
      conversationId={conversationId}
      baseMessages={baseMessages}
      participants={participants}
      currentUserId={currentUserId}
    />
  );
}
