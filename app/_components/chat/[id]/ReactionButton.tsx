"use client";

import { Box, IconButton, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface ReactionButtonProps {
  icon: ReactNode;
  count: number;
  onClick: () => void;
}

export default function ReactionButton({
  icon,
  count,
  onClick,
}: ReactionButtonProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.25,
      }}
    >
      <IconButton
        size="small"
        onClick={onClick}
        sx={{ width: 24, height: 24, padding: 0.5 }}
      >
        {icon}
      </IconButton>
      {count > 0 && (
        <Typography
          variant="caption"
          sx={{
            fontSize: "0.75rem",
            minWidth: "1ch",
            textAlign: "center",
          }}
        >
          {count}
        </Typography>
      )}
    </Box>
  );
}
