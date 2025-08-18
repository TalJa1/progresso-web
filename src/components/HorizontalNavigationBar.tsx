import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  Button,
  Menu,
  MenuItem,
  Divider,
  useMediaQuery,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
// PersonIcon removed (not used) to avoid lint warnings
import LogoutIcon from "@mui/icons-material/Logout";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useState, useEffect } from "react";
import HomeIcon from "@mui/icons-material/Home";
import SchoolIcon from "@mui/icons-material/School";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import WorkIcon from "@mui/icons-material/Work";
import NotificationsIcon from "@mui/icons-material/Notifications";

const HorizontalNavigationBar = () => {
  const isMobile = useMediaQuery("(max-width:900px)");
  const isCompactTabs = useMediaQuery("(max-width:1320px)");
  const isSmallOrMobile = useMediaQuery("(max-width:900px)");
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // load google user after component mounts and keep in state
  let avatarEl;
  const [parsedUser, setParsedUser] = useState<{
    name?: string;
    photoURL?: string;
  } | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("googleUser");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      setParsedUser(parsed);
    } catch {
      setParsedUser(null);
    }
  }, []);

  if (parsedUser && parsedUser.photoURL) {
    avatarEl = (
      <Avatar
        src={parsedUser.photoURL}
        alt={parsedUser.name}
        sx={{ width: 40, height: 40, cursor: "pointer" }}
        onClick={handleMenuOpen}
      />
    );
  } else {
    const initials =
      parsedUser && parsedUser.name
        ? parsedUser.name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
        : "CT";
    avatarEl = (
      <Avatar
        sx={{
          bgcolor: "#f5c6c6",
          color: "#fff",
          fontWeight: 700,
          cursor: "pointer",
        }}
        onClick={handleMenuOpen}
      >
        {initials}
      </Avatar>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        pt: 3,
        pb: 3,
      }}
    >
      <Box
        sx={{
          width: { xs: "98%", sm: "90%", md: "80%", lg: "70%", xl: "1400px" },
          maxWidth: 1400,
          borderRadius: 8,
          boxShadow: "0 4px 24px 0 rgba(0,0,0,0.3)",
          bgcolor: "#fff",
          overflow: "hidden",
        }}
      >
        <AppBar
          position="static"
          color="inherit"
          elevation={0}
          sx={{ bgcolor: "transparent", boxShadow: "none", borderRadius: 0 }}
        >
          <Toolbar
            sx={{ display: "flex", justifyContent: "space-between", px: 3 }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography
                variant="h4"
                sx={{ fontWeight: 900, color: "#e53935", letterSpacing: 1 }}
              >
                Progresso
              </Typography>
              {/* Tabs only visible on desktop */}
              {!isMobile && (
                <>
                  <Button
                    startIcon={<HomeIcon />}
                    sx={{
                      textTransform: "none",
                      color: "text.primary",
                      fontWeight: 700,
                      display: { xs: "none", sm: "none", md: "inline-flex" },
                    }}
                    onClick={() => navigate("/home")}
                  >
                    {!isCompactTabs ? "Home" : null}
                  </Button>
                  <Button
                    startIcon={<SchoolIcon />}
                    sx={{
                      textTransform: "none",
                      color: "text.primary",
                      fontWeight: 700,
                      display: { xs: "none", sm: "none", md: "inline-flex" },
                    }}
                    onClick={() => navigate("/exams")}
                  >
                    {!isCompactTabs ? "Exams" : null}
                  </Button>
                  <Button
                    startIcon={<WorkIcon />}
                    sx={{
                      textTransform: "none",
                      color: "text.primary",
                      fontWeight: 700,
                      display: { xs: "none", sm: "none", md: "inline-flex" },
                    }}
                    onClick={() => navigate("/submissions")}
                  >
                    {!isCompactTabs ? "Submissions" : null}
                  </Button>
                  <Button
                    startIcon={<CalendarTodayIcon />}
                    sx={{
                      textTransform: "none",
                      color: "text.primary",
                      fontWeight: 700,
                      display: { xs: "none", sm: "none", md: "inline-flex" },
                    }}
                    onClick={() => navigate("/schedule")}
                  >
                    {!isCompactTabs ? "Schedule" : null}
                  </Button>
                </>
              )}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {!isMobile && (
                <Button
                  variant="outlined"
                  size="small"
                  sx={{
                    borderRadius: 2,
                    fontWeight: 700,
                    display: { xs: "none", sm: "none", md: "inline-flex" },
                  }}
                >
                  UTC+07:00
                </Button>
              )}
              <IconButton>
                <NotificationsIcon />
              </IconButton>
              {avatarEl}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                keepMounted
                PaperProps={{ sx: { minWidth: 220 } }}
              >
                {/* Header with user name */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    px: 2,
                    py: 1.5,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {parsedUser?.name ?? "User"}
                    </Typography>
                  </Box>
                  <IconButton disabled size="small" onClick={handleMenuClose}>
                    <ChevronRightIcon />
                  </IconButton>
                </Box>
                <Divider sx={{ borderStyle: "dashed" }} />

                {/* show navigation links in menu for small screens or mobile */}
                {(isMobile || isSmallOrMobile) && (
                  <>
                    <MenuItem
                      onClick={() => {
                        handleMenuClose();
                        navigate("/home");
                      }}
                    >
                      <HomeIcon sx={{ mr: 1 }} /> Home
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleMenuClose();
                        navigate("/exams");
                      }}
                    >
                      <SchoolIcon sx={{ mr: 1 }} /> Exams
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleMenuClose();
                        navigate("/submissions");
                      }}
                    >
                      <WorkIcon sx={{ mr: 1 }} /> Submissions
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleMenuClose();
                        navigate("/schedule");
                      }}
                    >
                      <CalendarTodayIcon sx={{ mr: 1 }} /> Schedule
                    </MenuItem>
                    <Divider key="div1" />
                  </>
                )}

                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    navigate("/profile");
                  }}
                >
                  My Profile
                </MenuItem>
                <MenuItem disabled onClick={handleMenuClose}>
                  Help and Support
                </MenuItem>
                <MenuItem disabled onClick={handleMenuClose}>
                  Refer & Earn
                </MenuItem>
                <Divider sx={{ borderStyle: "dashed" }} />
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    localStorage.removeItem("googleUser");
                    navigate("/");
                  }}
                  sx={{ color: "error.main", fontWeight: 700 }}
                >
                  <LogoutIcon sx={{ mr: 1 }} /> Logout
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>
      </Box>
    </Box>
  );
};

export default HorizontalNavigationBar;
