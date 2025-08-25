import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
} from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
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
        minHeight: "100vh",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundImage:
          'url("https://res.cloudinary.com/dyhnzac8w/image/upload/v1754451247/paper1_wallpaper_avqflu.jpg")',
      }}
    >
      <HorizontalNavigationBar />
      <Box sx={{ maxWidth: 800, mx: "auto" }}>
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              mb: 2,
              color: "#0f172a",
              letterSpacing: "-0.5px",
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
              borderRadius: 99,
              px: 3,
              boxShadow: "0 6px 18px rgba(59, 52, 255, 0.12)",
              textTransform: "none",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: 1,
              background: "linear-gradient(90deg,#5b8cff,#7c5cff)",
            }}
          >
            📝 Memo card
          </Button>
          <Button
            variant="contained"
            sx={{
              color: "#0f172a",
              fontWeight: 700,
              borderRadius: 99,
              px: 3,
              py: 1.25,
              boxShadow: "none",
              textTransform: "none",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: 1,
              background: "linear-gradient(90deg,#dbeafe,#bfdbfe)",
            }}
          >
            🔄 Self-study
          </Button>
          <Button
            variant="outlined"
            sx={{
              color: "#94a3b8",
              fontWeight: 700,
              borderRadius: 99,
              px: 3,
              py: 1.25,
              textTransform: "none",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: 1,
              borderColor: "rgba(15,23,42,0.06)",
              bgcolor: "rgba(255,255,255,0.02)",
            }}
          >
            📊 Test
          </Button>
          <Button
            variant="outlined"
            sx={{
              color: "#94a3b8",
              fontWeight: 700,
              borderRadius: 99,
              px: 3,
              py: 1.25,
              textTransform: "none",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: 1,
              borderColor: "rgba(15,23,42,0.06)",
              bgcolor: "rgba(255,255,255,0.02)",
            }}
          >
            🧩 Blocks
          </Button>
          <Button
            variant="outlined"
            sx={{
              color: "#94a3b8",
              fontWeight: 700,
              borderRadius: 99,
              px: 3,
              py: 1.25,
              textTransform: "none",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: 1,
              borderColor: "rgba(15,23,42,0.06)",
              bgcolor: "rgba(255,255,255,0.02)",
            }}
          >
            💥 Blast
          </Button>
        </Box>

        {/* Quiz Card Section */}
        <Paper
          elevation={1}
          sx={{
            borderRadius: 12,
            p: { xs: 4, md: 6 },
            mb: 3,
            // light card so content is clearly visible
            background: "linear-gradient(180deg,#ffffff 0%, #f8fafc 100%)",
            border: "1px solid rgba(15,23,42,0.04)",
            minHeight: 360,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 8px 28px rgba(2,6,23,0.08)",
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
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIdx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: "easeInOut" }}
                style={{ width: "100%" }}
              >
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
                    color: "#0f172a",
                    fontWeight: 800,
                    mb: 4,
                    fontSize: { xs: 22, sm: 28, md: 34 },
                    minHeight: 70,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    lineHeight: 1.15,
                  }}
                >
                  {quizlets[currentIdx].question}
                </Typography>

                {!showAnswer ? (
                  <Box sx={{ textAlign: "center", mb: 3 }}>
                    <Button
                      variant="contained"
                      onClick={() => setShowAnswer(true)}
                      sx={{
                        color: "#0f172a",
                        bgcolor: "#eef2ff",
                        fontWeight: 700,
                        fontSize: "15px",
                        textTransform: "none",
                        borderRadius: 999,
                        px: 3,
                        py: 1,
                        border: "1px solid rgba(59,130,246,0.12)",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: "0 8px 18px rgba(59,130,246,0.08)",
                        },
                      }}
                    >
                      Do you know?
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: "center", mb: 3 }}>
                    <Typography
                      variant="body1"
                      sx={{
                        color: "#ffffff",
                        fontWeight: 800,
                        fontSize: "18px",
                        borderRadius: 6,
                        px: 4,
                        py: 1.5,
                        display: "inline-block",
                        // colorful gradient background
                        background: "linear-gradient(90deg, #60a5fa 0%, #7c3aed 60%, #ef6aa3 100%)",
                        boxShadow: "0 10px 24px rgba(124,58,237,0.14)",
                        textAlign: 'center'
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
                    variant="text"
                    disabled={currentIdx === 0}
                    onClick={handleBack}
                    sx={{
                      color: "#64748b",
                      borderRadius: 3,
                      px: 2.5,
                      py: 1.25,
                      background: "transparent",
                      textTransform: "none",
                    }}
                  >
                    <ArrowBackIcon sx={{ mr: 1 }} />
                    Back
                  </Button>

                  <Typography variant="body2" sx={{ color: "#64748b" }}>
                    {currentIdx + 1} / {quizlets.length}
                  </Typography>

                  <Button
                    variant="contained"
                    disabled={currentIdx === quizlets.length - 1}
                    onClick={handleNext}
                    sx={{
                      color: "#ffffff",
                      bgcolor: "#0f172a",
                      borderRadius: 8,
                      px: 2.5,
                      py: 1.25,
                      fontWeight: 700,
                      textTransform: "none",
                      "&:hover": { bgcolor: "#0b1220" },
                    }}
                  >
                    Next
                    <ArrowForwardIcon sx={{ ml: 1 }} />
                  </Button>
                </Box>
              </motion.div>
            </AnimatePresence>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default QuizletView;
