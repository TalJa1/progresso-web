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
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import { useState } from "react";
import HomeIcon from "@mui/icons-material/Home";
import SchoolIcon from "@mui/icons-material/School";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import WorkIcon from "@mui/icons-material/Work";
import NotificationsIcon from "@mui/icons-material/Notifications";

const HorizontalNavigationBar = () => {
  const isMobile = useMediaQuery("(max-width:900px)");
  const isCompactTabs = useMediaQuery("(max-width:1320px)");
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  let avatarEl;
  const googleUser = localStorage.getItem("googleUser");
  if (googleUser) {
    try {
      const parsed = JSON.parse(googleUser);
      avatarEl = (
        <Avatar
          src={parsed.photoURL}
          alt={parsed.name}
          sx={{ width: 40, height: 40, cursor: "pointer" }}
          onClick={handleMenuOpen}
        />
      );
    } catch {
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
          CT
        </Avatar>
      );
    }
  } else {
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
        CT
      </Avatar>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        mt: 3,
        mb: 3,
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
              >
                {isMobile && [
                  <MenuItem
                    key="home"
                    onClick={() => {
                      handleMenuClose();
                      navigate("/home");
                    }}
                  >
                    <HomeIcon sx={{ mr: 1 }} /> Home
                  </MenuItem>,
                  <MenuItem
                    key="exams"
                    onClick={() => {
                      handleMenuClose();
                      navigate("/exams");
                    }}
                  >
                    <SchoolIcon sx={{ mr: 1 }} /> Exams
                  </MenuItem>,
                  <MenuItem
                    key="submissions"
                    onClick={() => {
                      handleMenuClose();
                      navigate("/submissions");
                    }}
                  >
                    <WorkIcon sx={{ mr: 1 }} /> Submissions
                  </MenuItem>,
                  <MenuItem
                    key="schedule"
                    onClick={() => {
                      handleMenuClose();
                      navigate("/schedule");
                    }}
                  >
                    <CalendarTodayIcon sx={{ mr: 1 }} /> Schedule
                  </MenuItem>,
                  <Divider key="div1" />,
                  <MenuItem key="utc" onClick={handleMenuClose}>
                    UTC+07:00
                  </MenuItem>,
                  <Divider key="div2" />,
                ]}
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    navigate("/profile");
                  }}
                >
                  <PersonIcon sx={{ mr: 1 }} /> Profile
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    localStorage.removeItem("googleUser");
                    navigate("/");
                  }}
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
