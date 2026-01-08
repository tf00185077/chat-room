import { List, Paper } from "@mui/material";
import type { ConversationListItem } from "../types";
import ConversationListItemComponent from "./ConversationListItem";

interface ConversationListProps {
  conversations: ConversationListItem[];
}

export default function ConversationList({ conversations }: ConversationListProps) {
  return (
    <Paper elevation={1}>
      <List>
        {conversations.map((item) => (
          <ConversationListItemComponent key={item.conversation.id} item={item} />
        ))}
      </List>
    </Paper>
  );
}
