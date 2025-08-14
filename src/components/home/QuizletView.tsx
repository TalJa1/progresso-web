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
import type { QuizletModel } from "../../services/apiModel";

const QuizletView = () => {
  const { lessonId } = useParams();
  const [quizlets, setQuizlets] = useState<QuizletModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const getOptions = (currentQuizlet: QuizletModel) => {
    const options = ["Enhancement survey", "Eagerly", "Relate to", "Approved"];
    if (!options.includes(currentQuizlet.answer)) {
      options[Math.floor(Math.random() * 4)] = currentQuizlet.answer;
    }
    return options;
  };

  useEffect(() => {
    const fetchQuizlets = async () => {
      setLoading(true);
      setError(null);
      setSelectedOption(null);
      try {
        if (lessonId) {
          const data = await getQuizletByLessonId(Number(lessonId));
          setQuizlets(data);
        } else {
          setQuizlets([]);
        }
      } catch {
        setError("Failed to load quiz questions.");
        setQuizlets([]);
      }
      setLoading(false);
    };
    fetchQuizlets();
  }, [lessonId]);

  const handleNext = () => {
    setCurrentIdx((idx) => Math.min(quizlets.length - 1, idx + 1));
    setSelectedOption(null);
  };
  const handleBack = () => {
    setCurrentIdx((idx) => Math.max(0, idx - 1));
    setSelectedOption(null);
  };

  return (
    <Box>
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
            Lesson Title
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
                  mb: 4,
                  fontSize: "16px",
                }}
              >
                Answer the question
              </Typography>

              {/* Multiple Choice Options */}
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 4 }}
              >
                {getOptions(quizlets[currentIdx]).map((option, index) => (
                  <Button
                    key={index}
                    variant="outlined"
                    sx={{
                      justifyContent: "flex-start",
                      borderRadius: 2,
                      fontWeight: 600,
                      fontSize: 16,
                      px: 3,
                      py: 2.5,
                      borderColor:
                        selectedOption === index ? "#3b4fff" : "#4b5563",
                      bgcolor: selectedOption === index ? "#1e1b4b" : "#2d3748",
                      color: "#ffffff",
                      boxShadow:
                        selectedOption === index
                          ? "0 0 0 2px rgba(59, 79, 255, 0.3)"
                          : "none",
                      textTransform: "none",
                      textAlign: "left",
                      "&:hover": {
                        bgcolor: "#374151",
                        borderColor: "#6b7280",
                      },
                    }}
                    onClick={() => setSelectedOption(index)}
                  >
                    <Box
                      sx={{
                        minWidth: 32,
                        height: 32,
                        borderRadius: "50%",
                        bgcolor: "#4b5563",
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        mr: 3,
                        fontSize: "14px",
                      }}
                    >
                      {index + 1}
                    </Box>
                    {option}
                  </Button>
                ))}
              </Box>

              {/* Bottom text */}
              <Box sx={{ textAlign: "center", mb: 3 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#6366f1",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  Do you know?
                </Typography>
              </Box>

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
