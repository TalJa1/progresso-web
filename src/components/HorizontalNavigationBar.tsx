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
import NotificationsIcon from "@mui/icons-material/Notifications";

const HorizontalNavigationBar = () => {
  let avatarEl;
  const googleUser = localStorage.getItem("googleUser");
  if (googleUser) {
    try {
      const parsed = JSON.parse(googleUser);
      avatarEl = <Avatar src={parsed.photoURL} alt={parsed.name} sx={{ width: 40, height: 40 }} />;
    } catch {
      avatarEl = <Avatar sx={{ bgcolor: "#f5c6c6", color: "#fff", fontWeight: 700 }}>CT</Avatar>;
    }
  } else {
    avatarEl = <Avatar sx={{ bgcolor: "#f5c6c6", color: "#fff", fontWeight: 700 }}>CT</Avatar>;
  }

  return (
    <Box sx={{
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      mt: 3,
      mb: 3,
    }}>
      <Box sx={{
        width: { xs: '98%', sm: '90%', md: '80%', lg: '70%', xl: '1200px' },
        maxWidth: 1200,
        borderRadius: 8,
        boxShadow: '0 4px 24px 0 rgba(0,0,0,0.3)',
        bgcolor: '#fff',
        overflow: 'hidden',
      }}>
        <AppBar
          position="static"
          color="inherit"
          elevation={0}
          sx={{ bgcolor: 'transparent', boxShadow: 'none', borderRadius: 0 }}
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
                Exams
              </Button>
              <Button
                startIcon={<WorkIcon />}
                sx={{
                  textTransform: "none",
                  color: "text.primary",
                  fontWeight: 700,
                }}
              >
                Submissions
              </Button>
              <Button
                startIcon={<CalendarTodayIcon />}
                sx={{
                  textTransform: "none",
                  color: "text.primary",
                  fontWeight: 700,
                }}
              >
                Schedule
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
              {avatarEl}
            </Box>
          </Toolbar>
        </AppBar>
      </Box>
    </Box>
  );
};

export default HorizontalNavigationBar;
