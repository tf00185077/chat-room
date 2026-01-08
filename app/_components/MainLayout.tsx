"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginSideNav from "./LoginSideNav";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { data: session, status } = useSession();
  const [loginDrawerOpen, setLoginDrawerOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    window.location.reload();
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => setLoginDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            聊天室
          </Typography>
          {status === "loading" ? (
            <Box sx={{ width: 100, height: 36 }} />
          ) : session ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar src={session.user.avatarUrl} alt={session.user.name} sx={{ width: 32, height: 32 }} />
              <Typography variant="body2">{session.user.name}</Typography>
              <Button
                color="inherit"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                size="small"
              >
                登出
              </Button>
            </Box>
          ) : (
            <Button
              color="inherit"
              startIcon={<LoginIcon />}
              onClick={() => setLoginDrawerOpen(true)}
            >
              登入
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>
      <LoginSideNav
        open={loginDrawerOpen}
        onClose={() => setLoginDrawerOpen(false)}
      />
    </Box>
  );
}
