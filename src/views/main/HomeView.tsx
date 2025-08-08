import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Avatar,
  CircularProgress,
} from "@mui/material";
import HorizontalNavigationBar from "../../components/HorizontalNavigationBar";
import { getAllLessons } from "../../apis/lessons/lessonAPI";
import type { LessonModel } from "../../services/apiModel";

const HomeView = () => {
  // Helper for dynamic event dates
  const today = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const getDateStr = (offset: number) => {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    return `${months[d.getMonth()]} ${pad(d.getDate())}, ${d.getFullYear()}`;
  };
  const [lessons, setLessons] = useState<LessonModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{
    displayName: "";
    email: "";
    photoURL: "";
    uid: "";
  } | null>(null);

  useEffect(() => {
    const googleUser = localStorage.getItem("googleUser");
    if (googleUser) {
      try {
        const parsed = JSON.parse(googleUser);
        setUser({
          displayName: parsed.displayName || "",
          email: parsed.email || "",
          photoURL: parsed.photoURL || "",
          uid: parsed.uid || "",
        });
      } catch {
        setUser(null);
      }
    }
    const fetchLessons = async () => {
      try {
        const data = await getAllLessons();
        setLessons(data);
      } catch {
        setLessons([]);
      }
      setLoading(false);
    };
    fetchLessons();
  }, []);

  return (
    <Box sx={{ bgcolor: "#fafafa", minHeight: "100%" }}>
      <HorizontalNavigationBar />
      <Box
        sx={{
          width: { xs: "98%", sm: "90%", md: "80%", lg: "70%", xl: "1200px" },
          maxWidth: 1200,
          mx: "auto",
          mt: 4,
          mb: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Hi{" "}
            <span style={{ fontWeight: 900 }}>
              {user?.displayName || "User"}
            </span>{" "}
            <span role="img" aria-label="wave">
              👋
            </span>
          </Typography>
        </Box>
        <Typography
          variant="body1"
          sx={{ color: "grey.600", mb: 3, textAlign: "center" }}
        >
          Let's start your learning journey
        </Typography>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, mb: 2, textAlign: "center" }}
        >
          My Lessons
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: 3,
            flexWrap: "wrap",
            justifyContent: "flex-start",
            width: "100%",
          }}
        >
          {loading ? (
            <CircularProgress />
          ) : lessons.length === 0 ? (
            <Typography>No lessons found.</Typography>
          ) : (
            lessons.map((lesson) => (
              <Paper
                key={lesson.id}
                elevation={3}
                sx={{
                  p: 2,
                  maxWidth: 320,
                  width: "100%",
                  borderRadius: 4,
                  boxShadow: 3,
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Avatar
                    variant="rounded"
                    sx={{
                      width: 120,
                      height: 80,
                      mb: 2,
                      bgcolor: "#e53935",
                      fontSize: 32,
                    }}
                  >
                    {lesson.title[0]}
                  </Avatar>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 700, textAlign: "center", mb: 1 }}
                  >
                    {lesson.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "grey.700", textAlign: "center", mb: 1 }}
                  >
                    {lesson.content.length > 60
                      ? lesson.content.slice(0, 60) + "..."
                      : lesson.content}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 1,
                    }}
                  >
                    <Typography variant="caption" sx={{ color: "grey.600" }}>
                      Topic ID: {lesson.topic_id}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{
                      borderRadius: 2,
                      fontWeight: 700,
                      fontSize: 16,
                      py: 1.2,
                      boxShadow: 1,
                    }}
                  >
                    {lesson.video_url ? "Continue" : "Get Started"}
                  </Button>
                </Box>
              </Paper>
            ))
          )}
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            mt: 5,
            mb: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Upcoming Events
          </Typography>
          <Button
            disabled
            variant="text"
            sx={{
              fontWeight: 700,
              color: "primary.main",
              fontSize: 16,
              textTransform: "none",
              px: 2,
            }}
            endIcon={<span style={{ fontSize: 20 }}>➔</span>}
          >
            View All
          </Button>
        </Box>
        <Box
          sx={{
            display: "flex",
            gap: 3,
            flexWrap: "wrap",
            alignItems: "stretch",
            width: "100%",
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 4,
              boxShadow: "0 4px 24px 0 rgba(0,0,0,0.08)",
              background: "linear-gradient(135deg, #eaffea 80%, #f6fff6 100%)",
              minWidth: 320,
              maxWidth: 340,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: "grey.700", mb: 1, display: "block" }}
            >
              Daily Doubt Resolution
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              DDRV 1 - {getDateStr(1)}
            </Typography>
            <Typography variant="body2" sx={{ color: "grey.800", mb: 1 }}>
              Progresso community
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Typography
                variant="body2"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <span role="img" aria-label="calendar">
                  🗓️
                </span>{" "}
                {getDateStr(1)}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "error.main", fontWeight: 700 }}
              >
                •
              </Typography>
              <Typography variant="body2">10:45 PM - 11:30 PM</Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <Button
              variant="contained"
              disabled
              fullWidth
              sx={{
                bgcolor: "grey.300",
                color: "grey.600",
                fontWeight: 700,
                borderRadius: 2,
                fontSize: 16,
                py: 1.2,
                boxShadow: 0,
                alignSelf: "flex-end",
              }}
            >
              Join Now
            </Button>
          </Paper>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 4,
              boxShadow: "0 4px 24px 0 rgba(0,0,0,0.08)",
              background: "linear-gradient(135deg, #eaffea 80%, #f6fff6 100%)",
              minWidth: 320,
              maxWidth: 340,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: "grey.700", mb: 1, display: "block" }}
            >
              Daily Doubt Resolution
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              DDR 1 - {getDateStr(2)}
            </Typography>
            <Typography variant="body2" sx={{ color: "grey.800", mb: 1 }}>
              Progresso community
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Typography
                variant="body2"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <span role="img" aria-label="calendar">
                  🗓️
                </span>{" "}
                {getDateStr(2)}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "error.main", fontWeight: 700 }}
              >
                •
              </Typography>
              <Typography variant="body2">04:00 PM - 05:00 PM</Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <Button
              variant="contained"
              disabled
              fullWidth
              sx={{
                bgcolor: "grey.300",
                color: "grey.600",
                fontWeight: 700,
                borderRadius: 2,
                fontSize: 16,
                py: 1.2,
                boxShadow: 0,
                alignSelf: "flex-end",
              }}
            >
              Join Now
            </Button>
          </Paper>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 4,
              boxShadow: "0 4px 24px 0 rgba(0,0,0,0.08)",
              background: "linear-gradient(135deg, #e6eaff 80%, #f6f6ff 100%)",
              minWidth: 320,
              maxWidth: 340,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
            }}
          >
            <Box sx={{ mb: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  bgcolor: "#e6eaff",
                  color: "primary.main",
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  fontWeight: 700,
                  display: "inline-block",
                }}
              >
                Lecture
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Fundamental of Math in logic
            </Typography>
            <Typography variant="body2" sx={{ color: "grey.800", mb: 1 }}>
              Progresso community
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Typography
                variant="body2"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <span role="img" aria-label="calendar">
                  🗓️
                </span>{" "}
                {getDateStr(3)}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "error.main", fontWeight: 700 }}
              >
                •
              </Typography>
              <Typography variant="body2">10:30 AM - 12:30 PM</Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <Button
              variant="contained"
              disabled
              fullWidth
              sx={{
                bgcolor: "grey.300",
                color: "grey.600",
                fontWeight: 700,
                borderRadius: 2,
                fontSize: 16,
                py: 1.2,
                boxShadow: 0,
                alignSelf: "flex-end",
              }}
            >
              Join Now
            </Button>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default HomeView;
