import {
  AppBar,
  Toolbar,
  Typography,
  Stack,
  Button,
  Box,
  useTheme,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Badge,
  TextField,
  InputAdornment,
} from "@mui/material";
import BalanceIcon from "@mui/icons-material/Balance";
// import AccountCircleIcon from '@mui/icons-material/AccountCircle'; // Not used
import NotificationsIcon from "@mui/icons-material/Notifications";
import SearchIcon from "@mui/icons-material/Search";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import PersonIcon from "@mui/icons-material/Person";
import FolderIcon from "@mui/icons-material/Folder";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useThemeContext } from "../../Context/ThemeContext";
import { useSearch } from "../../Context/SearchContext";
import { useAuth } from "../../Context/AuthContext";
import { Notification } from "../../Models/Notification";
// import { get } from "http"; // Not used
import { getNotifications } from "../../service/supabaseClient";

export const Navbar = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { toggleTheme } = useThemeContext();
  const { searchQuery, setSearchQuery } = useSearch();
  const { user, logout } = useAuth();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationsAnchor, setNotificationsAnchor] =
    useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const profileMenuId = "profile-menu-appbar";
  const notificationsMenuId = "notifications-menu-appbar";

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await getNotifications();
        setNotifications(response);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, []);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  const handleNotificationClick = (notification: Notification) => {
    handleNotificationsClose();

    if (notification.case_id) {
      navigate(`/case/${notification.case_id}`);
    } else {
      navigate("/notifications");
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);

    if (query.trim()) {
      navigate("/search-results");
    }
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const openProfileMenu = Boolean(anchorEl);
  const openNotificationsMenu = Boolean(notificationsAnchor);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor:
          theme.palette.mode === "dark"
            ? "rgba(18, 18, 18, 0.9)"
            : "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(10px)",
        borderBottom: `1px solid ${theme.palette.divider}`,
        transition:
          "background-color 0.3s ease-in-out, border-color 0.3s ease-in-out",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            minHeight: 70,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              "&:hover": {
                opacity: 0.8,
              },
            }}
            onClick={() => navigate("/")}
          >
            <BalanceIcon
              sx={{
                fontSize: 32,
                mr: 1,
                color: theme.palette.primary.main,
              }}
            />
            <Typography
              variant="h5"
              component="div"
              sx={{
                fontWeight: 700,
                letterSpacing: "0.5px",
                background: `linear-gradient(45deg, #2196f3, #0d47a1)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                display: { xs: "none", sm: "block" },
              }}
            >
              JustiWise
            </Typography>
          </Box>

          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              flex: 1,
              maxWidth: 500,
              mx: 4,
            }}
          >
            <TextField
              fullWidth
              placeholder="Site genelinde ara..."
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon
                      sx={{
                        color: theme.palette.text.secondary,
                      }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(0, 0, 0, 0.05)",
                  borderRadius: 2,
                  "&:hover": {
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.08)"
                        : "rgba(0, 0, 0, 0.08)",
                  },
                  "&.Mui-focused": {
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.12)"
                        : "rgba(0, 0, 0, 0.12)",
                  },
                  "& .MuiInputBase-input": {
                    color: theme.palette.text.primary,
                  },
                },
              }}
            />
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton
              aria-label="toggle theme"
              onClick={toggleTheme}
              sx={{
                color: theme.palette.text.primary,
                "&:hover": {
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.05)",
                },
              }}
            >
              {theme.palette.mode === "dark" ? (
                <Brightness7Icon />
              ) : (
                <Brightness4Icon />
              )}
            </IconButton>

            <IconButton
              aria-label="show notifications"
              aria-controls={
                openNotificationsMenu ? notificationsMenuId : undefined
              }
              aria-haspopup="true"
              aria-expanded={openNotificationsMenu ? "true" : undefined}
              onClick={handleNotificationsOpen}
              sx={{
                color: theme.palette.text.primary,
                "&:hover": {
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.05)",
                },
              }}
            >
              <Badge badgeContent={notifications.length} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <Button
              aria-controls={openProfileMenu ? profileMenuId : undefined}
              aria-haspopup="true"
              aria-expanded={openProfileMenu ? "true" : undefined}
              onClick={handleMenuOpen}
              startIcon={
                <Avatar sx={{ width: 28, height: 28 }}>
                  {user?.username?.[0]?.toUpperCase() || "U"}
                </Avatar>
              }
              sx={{
                textTransform: "none",
                color: theme.palette.text.primary,
                "&:hover": {
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.05)",
                },
              }}
            >
              <Typography
                variant="body2"
                sx={{ ml: 1, display: { xs: "none", sm: "block" } }}
              >
                {user?.username || "User"}
              </Typography>
            </Button>
          </Stack>

          <Menu
            id={profileMenuId}
            anchorEl={anchorEl}
            open={openProfileMenu}
            onClose={handleMenuClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: "visible",
                filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                mt: 1.5,
                bgcolor: theme.palette.mode === "dark" ? "#1e1e1e" : "white",
                "&:before": {
                  content: '""',
                  display: "block",
                  position: "absolute",
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: theme.palette.mode === "dark" ? "#1e1e1e" : "white",
                  transform: "translateY(-50%) rotate(45deg)",
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <MenuItem
              onClick={() => {
                handleMenuClose();
                navigate("/profile");
              }}
              sx={{
                color: theme.palette.text.primary,
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <PersonIcon sx={{ mr: 1 }} />
              Profil
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleMenuClose();
                navigate("/my-cases");
              }}
              sx={{
                color: theme.palette.text.primary,
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <FolderIcon sx={{ mr: 1 }} />
              Davalarım
            </MenuItem>
            <MenuItem
              onClick={() => {
                // TODO: Implement navigation or action for Settings
                handleMenuClose();
                // navigate('/settings');
              }}
              sx={{
                color: theme.palette.text.primary,
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <SettingsIcon sx={{ mr: 1 }} />
              Ayarlar
            </MenuItem>
            <MenuItem
              onClick={handleLogout}
              sx={{
                color: theme.palette.error.main,
                "&:hover": {
                  // Consistent hover for logout
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "rgba(255, 0, 0, 0.1)" // Error-related hover
                      : "rgba(211, 47, 47, 0.08)",
                },
              }}
            >
              <LogoutIcon sx={{ mr: 1 }} />
              Oturumu kapat
            </MenuItem>
          </Menu>

          <Menu
            id={notificationsMenuId}
            anchorEl={notificationsAnchor}
            open={openNotificationsMenu}
            onClose={handleNotificationsClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: "visible",
                filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                mt: 1.5,
                bgcolor: theme.palette.mode === "dark" ? "#1e1e1e" : "white",
                maxWidth: 350,
                "&:before": {
                  content: '""',
                  display: "block",
                  position: "absolute",
                  top: 0,
                  right: 14, // Adjust if notification icon position changes
                  width: 10,
                  height: 10,
                  bgcolor: theme.palette.mode === "dark" ? "#1e1e1e" : "white",
                  transform: "translateY(-50%) rotate(45deg)",
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            {notifications.length === 0 ? (
              <MenuItem
                disabled
                sx={{ color: theme.palette.text.secondary, cursor: "default" }}
              >
                <Typography variant="body2">Yeni bildirim yok</Typography>
              </MenuItem>
            ) : (
              notifications.map((notif) => (
                <MenuItem
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  sx={{
                    color: theme.palette.text.primary,
                    cursor: "pointer",
                    whiteSpace: "normal",
                    minHeight: "auto",
                    py: 1.5,
                    "&:hover": {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      width: "100%",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: "inherit",
                        fontWeight: notif.is_read ? 400 : 600,
                        mb: 0.5,
                      }}
                    >
                      {notif.message}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.text.secondary,
                        fontSize: "0.75rem",
                      }}
                    >
                      {notif.timestamp}
                    </Typography>
                  </Box>
                </MenuItem>
              ))
            )}

            {notifications.length > 0 && (
              <MenuItem
                divider
                onClick={() => {
                  handleNotificationsClose();
                  navigate("/notifications");
                }}
                sx={{
                  justifyContent: "center",
                  color: theme.palette.primary.main,
                  fontWeight: 500,
                  "&:hover": {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                <Typography variant="body2">
                  Tüm Bildirimleri Görüntüle
                </Typography>
              </MenuItem>
            )}
          </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
