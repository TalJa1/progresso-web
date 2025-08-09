import HorizontalNavigationBar from "../HorizontalNavigationBar";
import { Box, Typography } from "@mui/material";
import ReactMarkdown from "react-markdown";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getLessonById } from "../../apis/lessons/lessonAPI";
import type { LessonModel } from "../../services/apiModel";
import MenuIcon from "@mui/icons-material/Menu";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import DescriptionIcon from "@mui/icons-material/Description";
import BookmarkIcon from "@mui/icons-material/Bookmark";

const LearningView = () => {
  const { id } = useParams();
  const [lesson, setLesson] = useState<LessonModel | null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <Box sx={{ bgcolor: "#fafafa", minHeight: "100%" }}>
      <HorizontalNavigationBar />
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
                <MenuIcon sx={{ color: "#fff", fontSize: 28, mr: 1 }} />
                <span
                  style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}
                >
                  Study Plan
                </span>
              </Box>
              {/* Center: Lesson Title */}
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
