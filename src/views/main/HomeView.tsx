import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Avatar,
  CircularProgress,
  Container,
} from "@mui/material";
import HorizontalNavigationBar from "../../components/HorizontalNavigationBar";
import { getAllLessons } from "../../apis/lessons/lessonAPI";
import type { LessonModel } from "../../services/apiModel";

const HomeView = () => {
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
    <Box sx={{ bgcolor: "#fafafa", minHeight: "100vh" }}>
      <HorizontalNavigationBar />
      <Container
        maxWidth="md"
        sx={{
          mt: 4,
          mb: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          {user?.photoURL && (
            <Avatar
              src={user.photoURL}
              alt={user.displayName}
              sx={{ width: 48, height: 48 }}
            />
          )}
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
            justifyContent: "center",
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
      </Container>
    </Box>
  );
};

export default HomeView;
