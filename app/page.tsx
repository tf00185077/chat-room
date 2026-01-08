import { Typography, Box } from "@mui/material";
import { getConversationList } from "../lib/db";
import ConversationList from "./_components/ConversationList";

export default async function Home() {
  const conversations = await getConversationList();

  return (
    <Box sx={{ maxWidth: 800, margin: "0 auto", padding: 2 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 600 }}>
        對話列表
      </Typography>
      <ConversationList conversations={conversations} />
    </Box>
  );
}
