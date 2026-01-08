import { Box } from "@mui/material";
import { getConversationList } from "../lib/db/getConversationList";
import ConversationList from "./_components/ConversationList";
import MainLayout from "./_components/MainLayout";

export default async function Home() {
  const conversations = await getConversationList();

  return (
    <MainLayout>
      <Box sx={{ maxWidth: 800, margin: "0 auto", padding: 2 }}>
        <ConversationList conversations={conversations} />
      </Box>
    </MainLayout>
  );
}
