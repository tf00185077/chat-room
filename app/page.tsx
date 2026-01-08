import { Box, Typography } from "@mui/material";
import { getConversationList } from "../lib/db/getConversationList";
import ConversationList from "./_components/ConversationList";
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
