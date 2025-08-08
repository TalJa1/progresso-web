import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  Button,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import SchoolIcon from "@mui/icons-material/School";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import WorkIcon from "@mui/icons-material/Work";
import ForumIcon from "@mui/icons-material/Forum";
import NotificationsIcon from "@mui/icons-material/Notifications";

const HorizontalNavigationBar = () => {
  return (
    <AppBar
      position="static"
      color="inherit"
      elevation={0}
      sx={{ borderRadius: 3, mb: 2, bgcolor: "#fff" }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", px: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 900, color: "#e53935", letterSpacing: 1 }}
          >
            Progresso
          </Typography>
          <Button
            startIcon={<HomeIcon />}
            sx={{
              textTransform: "none",
              color: "text.primary",
              fontWeight: 700,
            }}
          >
            Home
          </Button>
          <Button
            startIcon={<SchoolIcon />}
            sx={{
              textTransform: "none",
              color: "text.primary",
              fontWeight: 700,
            }}
          >
            My Lessons
          </Button>
          <Button
            startIcon={<CalendarTodayIcon />}
            sx={{
              textTransform: "none",
              color: "text.primary",
              fontWeight: 700,
            }}
          >
            Academic Planner
          </Button>
          <Button
            startIcon={<WorkIcon />}
            sx={{
              textTransform: "none",
              color: "text.primary",
              fontWeight: 700,
            }}
          >
            Jobs
          </Button>
          <Button
            startIcon={<ForumIcon />}
            sx={{
              textTransform: "none",
              color: "text.primary",
              fontWeight: 700,
            }}
          >
            Discussions
          </Button>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            variant="outlined"
            size="small"
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            UTC+07:00
          </Button>
          <IconButton>
            <NotificationsIcon />
          </IconButton>
          {(() => {
            const googleUser = localStorage.getItem("googleUser");
            if (googleUser) {
              try {
                const parsed = JSON.parse(googleUser);
                return (
                  <Avatar src={parsed.photoURL} alt={parsed.name} sx={{ width: 40, height: 40 }} />
                );
              } catch {
                return (
                  <Avatar sx={{ bgcolor: "#f5c6c6", color: "#fff", fontWeight: 700 }}>A</Avatar>
                );
              }
            }
            return (
              <Avatar sx={{ bgcolor: "#f5c6c6", color: "#fff", fontWeight: 700 }}>A</Avatar>
            );
          })()}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default HorizontalNavigationBar;
