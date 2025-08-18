import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import HorizontalNavigationBar from "../../components/HorizontalNavigationBar";
import { getQuizletByLessonId } from "../../apis/lessons/lessonQuizletAPI";
import { getLessonById } from "../../apis/lessons/lessonAPI";
import type { QuizletModel, LessonModel } from "../../services/apiModel";

const QuizletView = () => {
  const { lessonId } = useParams();
  const [quizlets, setQuizlets] = useState<QuizletModel[]>([]);
  const [lesson, setLesson] = useState<LessonModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setShowAnswer(false);
      try {
        if (lessonId) {
          const [quizletData, lessonData] = await Promise.all([
            getQuizletByLessonId(Number(lessonId)),
            getLessonById(Number(lessonId)),
          ]);
          setQuizlets(quizletData);
          setLesson(lessonData);
        } else {
          setQuizlets([]);
          setLesson(null);
        }
      } catch {
        setError("Failed to load quiz or lesson data.");
        setQuizlets([]);
        setLesson(null);
      }
      setLoading(false);
    };
    fetchData();
  }, [lessonId]);

  const handleNext = () => {
    setCurrentIdx((idx) => Math.min(quizlets.length - 1, idx + 1));
    setShowAnswer(false);
  };
  const handleBack = () => {
    setCurrentIdx((idx) => Math.max(0, idx - 1));
    setShowAnswer(false);
  };

  return (
    <Box
      sx={{
        bgcolor: "#fafafa",
        minHeight: "100vh",
        backgroundImage:
          'url("https://res.cloudinary.com/dyhnzac8w/image/upload/v1754451247/paper1_wallpaper_avqflu.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <HorizontalNavigationBar />
      <Box sx={{ maxWidth: 800, mx: "auto" }}>
        <Box sx={{ mb: 1 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              mb: 2,
              color: "#000000ff",
            }}
          >
            {lesson?.title} quizlet
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5, mb: 4, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            sx={{
              color: "#fff",
              fontWeight: 700,
              borderRadius: 2,
              px: 3,
              py: 1.5,
              boxShadow: "none",
              textTransform: "none",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            📝 Thẻ ghi nhớ
          </Button>
          <Button
            variant="contained"
            sx={{
              color: "#fff",
              fontWeight: 700,
              borderRadius: 2,
              px: 3,
              py: 1.5,
              boxShadow: "none",
              textTransform: "none",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            🔄 Tự học
          </Button>
          <Button
            variant="contained"
            sx={{
              bgcolor: "#374151",
              color: "#9ca3af",
              fontWeight: 700,
              borderRadius: 2,
              px: 3,
              py: 1.5,
              boxShadow: "none",
              textTransform: "none",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            📊 Kiểm tra
          </Button>
          <Button
            variant="contained"
            sx={{
              bgcolor: "#374151",
              color: "#9ca3af",
              fontWeight: 700,
              borderRadius: 2,
              px: 3,
              py: 1.5,
              boxShadow: "none",
              textTransform: "none",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            🧩 Blocks
          </Button>
          <Button
            variant="contained"
            sx={{
              bgcolor: "#374151",
              color: "#9ca3af",
              fontWeight: 700,
              borderRadius: 2,
              px: 3,
              py: 1.5,
              boxShadow: "none",
              textTransform: "none",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            💥 Blast
          </Button>
        </Box>

        {/* Quiz Card Section */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            p: 4,
            mb: 3,
            bgcolor: "#374151",
            border: "1px solid #4b5563",
            minHeight: 320,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 200,
              }}
            >
              <CircularProgress sx={{ color: "#3b4fff" }} />
            </Box>
          ) : error ? (
            <Typography color="error" sx={{ color: "#ef4444" }}>
              {error}
            </Typography>
          ) : quizlets.length === 0 ? (
            <Typography sx={{ color: "#9ca3af" }}>
              No quiz questions found for this lesson.
            </Typography>
          ) : (
            <>
              <Typography
                variant="body1"
                sx={{
                  color: "#9ca3af",
                  mb: 2,
                  fontSize: "16px",
                }}
              >
                Answer these questions to test your knowledge
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  color: "#fff",
                  fontWeight: 700,
                  mb: 4,
                  fontSize: { xs: 22, sm: 28, md: 32 },
                  minHeight: 60,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                }}
              >
                {quizlets[currentIdx].question}
              </Typography>

              {!showAnswer ? (
                <Box sx={{ textAlign: "center", mb: 3 }}>
                  <Button
                    variant="text"
                    sx={{
                      color: "#6366f1",
                      fontWeight: 600,
                      fontSize: "16px",
                      textTransform: "none",
                      borderRadius: 2,
                    }}
                    onClick={() => setShowAnswer(true)}
                  >
                    Do you know?
                  </Button>
                </Box>
              ) : (
                <Box sx={{ textAlign: "center", mb: 3 }}>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "#22d3ee",
                      fontWeight: 600,
                      fontSize: "20px",
                      border: "1px solid #22d3ee",
                      borderRadius: 2,
                      p: 2,
                      display: "inline-block",
                      bgcolor: "#1e293b",
                    }}
                  >
                    {quizlets[currentIdx].answer}
                  </Typography>
                </Box>
              )}

              {/* Navigation */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Button
                  variant="outlined"
                  disabled={currentIdx === 0}
                  onClick={handleBack}
                  sx={{
                    color: "#9ca3af",
                    borderColor: "#4b5563",
                    "&:hover": {
                      borderColor: "#6b7280",
                    },
                  }}
                >
                  <ArrowBackIcon sx={{ mr: 1 }} />
                  Back
                </Button>

                <Typography variant="body2" sx={{ color: "#9ca3af" }}>
                  {currentIdx + 1} / {quizlets.length}
                </Typography>

                <Button
                  variant="outlined"
                  disabled={currentIdx === quizlets.length - 1}
                  onClick={handleNext}
                  sx={{
                    color: "#9ca3af",
                    borderColor: "#4b5563",
                    "&:hover": {
                      borderColor: "#6b7280",
                    },
                  }}
                >
                  Next
                  <ArrowForwardIcon sx={{ ml: 1 }} />
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default QuizletView;
