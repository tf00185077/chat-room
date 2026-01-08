import { getConversationList } from "../lib/db/getConversationList";
import MainLayout from "./_components/MainLayout";
import ConversationPageClient from "./_components/ConversationPageClient";

export default async function Home() {
  const conversations = await getConversationList();

  return (
    <MainLayout>
      <ConversationPageClient conversations={conversations} />
    </MainLayout>
  );
}
