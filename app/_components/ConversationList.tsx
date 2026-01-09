import { List, Paper, Box, Typography } from "@mui/material";
import type { ConversationListItem } from "../types";
import ConversationListItemComponent from "./ConversationListItem";

interface ConversationListProps {
  conversations: ConversationListItem[];
}

export default function ConversationList({ conversations }: ConversationListProps) {
  return (
    <Paper elevation={1}>
      {conversations.length === 0 ? (
        <Box
          sx={{
            p: 4,
            textAlign: "center",
            color: "text.secondary",
          }}
        >
          <Typography variant="body1" sx={{ mb: 1 }}>
            還沒有對話
          </Typography>
          <Typography variant="body2" color="text.secondary">
            點擊「新對話」按鈕開始第一個對話吧！
          </Typography>
        </Box>
      ) : (
        <List>
          {conversations.map((item) => (
            <ConversationListItemComponent key={item.conversation.id} item={item} />
          ))}
        </List>
      )}
    </Paper>
  );
}
