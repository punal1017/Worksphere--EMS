"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Avatar,
  Box,
  Button,
  ButtonBase,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";

const SIDEBAR_WIDTH = 250;
const COLLAPSED_WIDTH = 76;

const navigationItems = [
  { title: "Dashboard", route: "/dashboard", icon: <DashboardRoundedIcon />, roles: ["ADMIN", "HR", "EMPLOYEE"] },
  { title: "Team Management", route: "/employees", icon: <PeopleAltRoundedIcon />, roles: ["ADMIN", "HR"] },
  { title: "Attendance", route: "/attendance", icon: <AccessTimeRoundedIcon />, roles: ["ADMIN", "HR", "EMPLOYEE"] },
  { title: "Leave Management", route: "/leaves", icon: <EventAvailableRoundedIcon />, roles: ["ADMIN", "HR", "EMPLOYEE"] },
];

type StoredUser = {
  name?: string;
  role?: string;
};

export default function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user] = useState<StoredUser>(() => {
    if (typeof window === "undefined") return {};

    try {
      return JSON.parse(localStorage.getItem("currentUser") || "{}") as StoredUser;
    } catch {
      return {};
    }
  });

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("currentUser");
    router.replace("/sign-in");
  };

  const renderContent = (collapsed: boolean, mobile = false) => (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#fff",
      }}
    >
      <Box
        sx={{
          height: collapsed ? 104 : 76,
          px: collapsed ? 1.5 : 2,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          flexDirection: collapsed ? "column" : "row",
          gap: collapsed ? 0.5 : 1,
          flexShrink: 0,
        }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <GroupsRoundedIcon sx={{ fontSize: 32, color: "#4056c9" }} />
          {!collapsed && (
            <Typography variant="h6" fontWeight={800} color="#172554" noWrap>
              WorkSphere
            </Typography>
          )}
        </Stack>

        {mobile ? (
          <IconButton
            size="small"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          >
            <ChevronLeftRoundedIcon />
          </IconButton>
        ) : (
          <Tooltip title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
            <IconButton
              size="small"
              onClick={() => setOpen((previous) => !previous)}
              aria-label="Toggle sidebar"
              sx={{ border: "1px solid #e2e8f0", borderRadius: 2 }}
            >
              {collapsed ? <ChevronRightRoundedIcon /> : <ChevronLeftRoundedIcon />}
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Divider />

      <Box sx={{ flex: 1, py: 2, px: 1.25 }}>
        <List disablePadding>
          {navigationItems.filter((item) => item.roles.includes(user.role || "")).map((item) => {
            const active = pathname === item.route;
            const button = (
              <ListItemButton
                key={item.route}
                selected={active}
                onClick={() => {
                  setMobileOpen(false);
                  router.push(item.route);
                }}
                sx={{
                  minHeight: 46,
                  mb: 0.75,
                  px: collapsed ? 1.5 : 2,
                  borderRadius: 2.5,
                  justifyContent: collapsed ? "center" : "flex-start",
                  color: active ? "#4056c9" : "#64748b",
                  "& .MuiListItemIcon-root": {
                    color: "inherit",
                    minWidth: collapsed ? 0 : 38,
                    justifyContent: "center",
                  },
                  "&.Mui-selected, &.Mui-selected:hover": {
                    bgcolor: "#eef2ff",
                    color: "#4056c9",
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                {!collapsed && <ListItemText primary={item.title} />}
              </ListItemButton>
            );

            return collapsed && !mobile ? (
              <Tooltip key={item.route} title={item.title} placement="right">
                {button}
              </Tooltip>
            ) : (
              button
            );
          })}
        </List>
      </Box>

      <Divider />
      <Box sx={{ p: 1.5 }}>
        <ButtonBase
          onClick={() => router.push("/profile")}
          aria-label="Open profile"
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: collapsed ? "center" : "flex-start",
            borderRadius: 2,
            px: collapsed ? 0 : 0.75,
            py: 1,
            textAlign: "left",
            "&:hover": { bgcolor: "#f8fafc" },
          }}
        >
          <Stack
            direction="row"
            spacing={1.25}
            alignItems="center"
            justifyContent={collapsed ? "center" : "flex-start"}
          >
          <Avatar sx={{ width: 38, height: 38, bgcolor: "#dbeafe", color: "#1d4ed8" }}>
            {(user.name || "U").charAt(0).toUpperCase()}
          </Avatar>
          {!collapsed && (
            <Typography variant="body2" fontWeight={700} color="#172554" noWrap>
              {user.name || "User"}
            </Typography>
          )}
          </Stack>
        </ButtonBase>
        <Tooltip title={collapsed ? "Sign out" : ""} placement="right">
          {collapsed ? (
            <IconButton
              onClick={handleLogout}
              aria-label="Sign out"
              sx={{
                display: "flex",
                width: 46,
                height: 40,
                mx: "auto",
                p: 0,
                color: "#64748b",
                borderRadius: 2,
              }}
            >
              <LogoutRoundedIcon />
            </IconButton>
          ) : (
            <Button
              fullWidth
              onClick={handleLogout}
              startIcon={<LogoutRoundedIcon />}
              sx={{
                minHeight: 40,
                justifyContent: "flex-start",
                px: 1.5,
                color: "#64748b",
                textTransform: "none",
                borderRadius: 2,
              }}
            >
              Sign out
            </Button>
          )}
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: open ? SIDEBAR_WIDTH : COLLAPSED_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: open ? SIDEBAR_WIDTH : COLLAPSED_WIDTH,
            boxSizing: "border-box",
            borderRight: "1px solid #e5eaf2",
            overflowX: "hidden",
            transition: "width 0.2s ease",
          },
        }}
      >
        {renderContent(!open)}
      </Drawer>
      <IconButton
        onClick={() => setMobileOpen(true)}
        aria-label="Open sidebar"
        sx={{
          display: { xs: "inline-flex", md: "none" },
          position: "fixed",
          top: 16,
          left: 16,
          zIndex: 1200,
          bgcolor: "#fff",
          border: "1px solid #e5eaf2",
        }}
      >
        <MenuRoundedIcon />
      </IconButton>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ display: { xs: "block", md: "none" } }}
      >
        {renderContent(false, true)}
      </Drawer>
    </>
  );
}

export { COLLAPSED_WIDTH, SIDEBAR_WIDTH };
