"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import {
  Drawer,
  Box,
  TextField,
  Button,
  Alert,
  Tabs,
  Tab,
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

interface LoginSideNavProps {
  open: boolean;
  onClose: () => void;
}

export default function LoginSideNav({ open, onClose }: LoginSideNavProps) {
  const [tabValue, setTabValue] = useState(0);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError("");
    setName("");
    setPassword("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        name,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("名稱或密碼錯誤");
      } else {
        onClose();
        window.location.reload();
      }
    } catch (error) {
      setError("登入失敗，請重試");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "註冊失敗，請重試");
        return;
      }

      const result = await signIn("credentials", {
        name,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("註冊成功，但自動登入失敗，請手動登入");
      } else {
        onClose();
        window.location.reload();
      }
    } catch (error) {
      setError("註冊失敗，請重試");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Box
        sx={{
          width: 300,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="登入" icon={<LoginIcon />} iconPosition="start" />
          <Tab label="註冊" icon={<PersonAddIcon />} iconPosition="start" />
        </Tabs>
        <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <form
            onSubmit={tabValue === 0 ? handleLogin : handleRegister}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="名稱"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                fullWidth
                size="small"
              />
              <TextField
                label="密碼"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
                size="small"
                helperText={tabValue === 1 ? "至少 6 個字元" : ""}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                startIcon={tabValue === 0 ? <LoginIcon /> : <PersonAddIcon />}
                disabled={isLoading}
              >
                {isLoading
                  ? tabValue === 0
                    ? "登入中..."
                    : "註冊中..."
                  : tabValue === 0
                  ? "登入"
                  : "註冊"}
              </Button>
            </Box>
          </form>
        </Box>
      </Box>
    </Drawer>
  );
}
