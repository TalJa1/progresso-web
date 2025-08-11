import HorizontalNavigationBar from "../HorizontalNavigationBar";
import {
  Box,
  Typography,
  Drawer,
  Card,
  CardContent,
  IconButton,
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getLessonById } from "../../apis/lessons/lessonAPI";
import type { LessonModel } from "../../services/apiModel";
import MenuIcon from "@mui/icons-material/Menu";
import SchoolIcon from "@mui/icons-material/School";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import DescriptionIcon from "@mui/icons-material/Description";
import BookmarkIcon from "@mui/icons-material/Bookmark";

const LearningView = () => {
  const { id } = useParams();
  const [lesson, setLesson] = useState<LessonModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [allLessons, setAllLessons] = useState<LessonModel[]>([]);

  useEffect(() => {
    const fetchLesson = async () => {
      setLoading(true);
      try {
        if (id) {
          const data = await getLessonById(Number(id));
          setLesson(data);
        }
      } catch {
        setLesson(null);
      }
      setLoading(false);
    };
    fetchLesson();
  }, [id]);

  useEffect(() => {
    // Fetch all lessons for drawer
    const fetchAllLessons = async () => {
      try {
        const lessons = await import("../../apis/lessons/lessonAPI").then((m) =>
          m.getAllLessons()
        );
        setAllLessons(lessons);
      } catch {
        setAllLessons([]);
      }
    };
    fetchAllLessons();
  }, []);

  return (
    <Box sx={{ bgcolor: "#fafafa", minHeight: "100%" }}>
      <HorizontalNavigationBar />
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 320, p: 2, bgcolor: "#f5f5f5", height: "100%" }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
            All Lessons
          </Typography>
          {allLessons.map((l) => (
            <Card
              key={l.id}
              sx={{
                mb: 2,
                display: "flex",
                alignItems: "center",
                boxShadow: 2,
                cursor: "pointer",
                transition: "box-shadow 0.2s",
                "&:hover": { boxShadow: 6, bgcolor: "#e3f2fd" },
              }}
              onClick={() => {
                setDrawerOpen(false);
                window.location.href = `/learning/${l.id}`;
              }}
            >
              <SchoolIcon sx={{ color: "#1976d2", fontSize: 32, m: 2 }} />
              <CardContent sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                  {l.title}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Drawer>
      <Box
        sx={{
          width: { xs: "98%", sm: "90%", md: "80%", lg: "70%", xl: "1300px" },
          maxWidth: 1300,
          mx: "auto",
          mt: 4,
          mb: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        {loading ? (
          <Typography>Loading...</Typography>
        ) : lesson ? (
          <>
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                mb: 1,
                p: 2,
                borderRadius: 3,
                backgroundColor: "#000000ff",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <IconButton onClick={() => setDrawerOpen(true)}>
                  <MenuIcon sx={{ color: "#fff", fontSize: 28, mr: 1 }} />
                </IconButton>
              </Box>
              <Box
                sx={{
                  color: "#fff",
                  fontSize: 32,
                  fontWeight: "bold",
                  textAlign: "center",
                  flex: 1,
                  mx: 2,
                }}
              >
                {lesson?.title}
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <WarningAmberIcon sx={{ color: "#fff", fontSize: 28 }} />
                <DescriptionIcon sx={{ color: "#fff", fontSize: 28 }} />
                <BookmarkIcon sx={{ color: "#fff", fontSize: 28 }} />
              </Box>
            </Box>
            <Box sx={{ mb: 2, width: "100%" }}>
              <ReactMarkdown>
                {lesson.content.replace(/\\n/g, "\n")}
              </ReactMarkdown>
            </Box>
            <Box
              sx={{ width: "100%", maxWidth: 600, mb: 2, alignSelf: "center" }}
            >
              <video
                src={lesson.video_url}
                controls
                style={{ width: "100%", borderRadius: 8, background: "#000" }}
              />
            </Box>
          </>
        ) : (
          <Typography>Lesson not found.</Typography>
        )}
      </Box>
    </Box>
  );
};

export default LearningView;
