import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { getQuestionsWithAnswersByExamId } from "../../apis/lessons/QuestionAnswerAPI";
import type { QuestionModel } from "../../services/apiModel";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";

const ExamProcessView = () => {
  const { examId } = useParams<{ examId: string }>();
  type QuestionWithSelected = QuestionModel & { selected?: string | string[] };
  const [questions, setQuestions] = useState<QuestionWithSelected[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);
      try {
        if (examId) {
          const data = await getQuestionsWithAnswersByExamId(Number(examId));
          setQuestions(
            data.map((q: QuestionModel) => ({
              ...q,
              selected: q.type === "multiple" ? [] : "",
            }))
          );
        }
      } catch {
        setError("Failed to load questions.");
      }
      setLoading(false);
    };
    fetchQuestions();
  }, [examId]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (loading) return <div>Loading questions...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        backgroundImage:
          'url("https://res.cloudinary.com/dyhnzac8w/image/upload/v1754451247/paper1_wallpaper_avqflu.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100vh",
      }}
    >
      <Box
        sx={{
          flexDirection: "row",
          width: "60%",
          pt: 5,
          height: "70%",
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
            bgcolor: "rgba(255, 255, 255, 0.45)",
            borderRadius: 3,
            p: 4,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {questions.length === 0 ? (
            <Typography>No questions found for this exam.</Typography>
          ) : (
            <>
              {/* Progress Bar and Header */}
              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, color: "#6b6b6b" }}
                  >
                    MCT Mock Tests
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#6b6b6b", fontWeight: 500 }}
                  >
                    {Math.round(((currentIdx + 1) / questions.length) * 100)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={((currentIdx + 1) / questions.length) * 100}
                  sx={{
                    height: 8,
                    borderRadius: 5,
                    mb: 2,
                    bgcolor: "#ede7f6",
                    "& .MuiLinearProgress-bar": { bgcolor: "#7c3aed" },
                  }}
                />
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    // mb: 2,
                  }}
                >
                  <Typography variant="body2" sx={{ color: "#6b6b6b" }}>
                    Session 1
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{
                        borderRadius: 2,
                        fontWeight: 600,
                        textTransform: "none",
                        px: 2,
                        py: 0.5,
                        minWidth: 80,
                        borderColor: "#c7d2fe",
                        color: "#6366f1",
                        bgcolor: "#f5f3ff",
                        "&:hover": {
                          bgcolor: "#ede9fe",
                          borderColor: "#6366f1",
                        },
                      }}
                    >
                      review
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{
                        borderRadius: 2,
                        fontWeight: 600,
                        textTransform: "none",
                        px: 2,
                        py: 0.5,
                        minWidth: 120,
                        borderColor: "#c7d2fe",
                        color: "#6366f1",
                        bgcolor: "#f5f3ff",
                        "&:hover": {
                          bgcolor: "#ede9fe",
                          borderColor: "#6366f1",
                        },
                      }}
                    >
                      Mark as review
                    </Button>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#6b6b6b",
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        mr: 0.5,
                      }}
                    >
                      <svg
                        width="18"
                        height="18"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="#a78bfa"
                          strokeWidth="2"
                          fill="none"
                        />
                        <path
                          d="M12 7v5l3 3"
                          stroke="#a78bfa"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Box>
                    {formatTime(timeLeft)} Min
                  </Typography>
                </Box>
              </Box>
              {/* Question */}
              <Box sx={{ mb: 3, px: 15, widows: "100%" }}>
                <Typography
                  variant="subtitle2"
                  sx={{ color: "#a3a3a3", fontWeight: 600, mb: 1 }}
                >
                  Question {currentIdx + 1}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ mb: 3, color: "#222", fontWeight: 700 }}
                >
                  {questions[currentIdx].content}
                </Typography>
                <FormControl component="fieldset" sx={{ width: "100%" }}>
                  {questions[currentIdx].type === "multiple" ? (
                    <>
                      {questions[currentIdx].answers.map((ans) => (
                        <FormControlLabel
                          key={ans.id}
                          control={
                            <Checkbox
                              checked={
                                Array.isArray(questions[currentIdx].selected) &&
                                questions[currentIdx].selected.includes(
                                  ans.id.toString()
                                )
                              }
                              onChange={(_, checked) => {
                                setQuestions((prev) =>
                                  prev.map((q, idx) => {
                                    if (idx !== currentIdx) return q;
                                    let selectedArr = Array.isArray(q.selected)
                                      ? [...q.selected]
                                      : [];
                                    if (checked) {
                                      selectedArr.push(ans.id.toString());
                                    } else {
                                      selectedArr = selectedArr.filter(
                                        (id) => id !== ans.id.toString()
                                      );
                                    }
                                    return { ...q, selected: selectedArr };
                                  })
                                );
                              }}
                              sx={{
                                color: "#a78bfa",
                                "&.Mui-checked": { color: "#7c3aed" },
                              }}
                            />
                          }
                          label={
                            <Box
                              sx={{
                                px: 2,
                                py: 1,
                                borderRadius: 2,
                                bgcolor:
                                  Array.isArray(
                                    questions[currentIdx].selected
                                  ) &&
                                  questions[currentIdx].selected.includes(
                                    ans.id.toString()
                                  )
                                    ? "#f5f3ff"
                                    : "#fff",
                                fontWeight: 600,
                                color: "#4b5563",
                                border:
                                  Array.isArray(
                                    questions[currentIdx].selected
                                  ) &&
                                  questions[currentIdx].selected.includes(
                                    ans.id.toString()
                                  )
                                    ? "1.5px solid #a78bfa"
                                    : "1.5px solid #e5e7eb",
                                width: "100%",
                              }}
                            >
                              {ans.content}
                            </Box>
                          }
                          sx={{
                            mb: 1,
                            width: "100%",
                            mx: 0,
                            display: "flex",
                            alignItems: "center",
                            px: 0,
                            // make the label element take remaining width
                            "& .MuiFormControlLabel-label": { width: "100%" },
                          }}
                        />
                      ))}
                    </>
                  ) : (
                    <RadioGroup
                      name={`question-${questions[currentIdx].id}`}
                      value={questions[currentIdx].selected || ""}
                      onChange={(_, value) => {
                        setQuestions((prev) =>
                          prev.map((q, idx) =>
                            idx === currentIdx ? { ...q, selected: value } : q
                          )
                        );
                      }}
                    >
                      {questions[currentIdx].answers.map((ans) => (
                        <FormControlLabel
                          key={ans.id}
                          value={ans.id.toString()}
                          control={
                            <Radio
                              sx={{
                                color: "#a78bfa",
                                "&.Mui-checked": { color: "#7c3aed" },
                              }}
                            />
                          }
                          label={
                            <Box
                              sx={{
                                px: 2,
                                py: 1,
                                borderRadius: 2,
                                bgcolor:
                                  questions[currentIdx].selected ===
                                  ans.id.toString()
                                    ? "#f5f3ff"
                                    : "#fff",
                                fontWeight: 600,
                                color: "#4b5563",
                                border:
                                  questions[currentIdx].selected ===
                                  ans.id.toString()
                                    ? "1.5px solid #a78bfa"
                                    : "1.5px solid #e5e7eb",
                                width: "100%",
                              }}
                            >
                              {ans.content}
                            </Box>
                          }
                          sx={{
                            mb: 1,
                            width: "100%",
                            mx: 0,
                            display: "flex",
                            alignItems: "center",
                            px: 0,
                            "& .MuiFormControlLabel-label": { width: "100%" },
                          }}
                        />
                      ))}
                    </RadioGroup>
                  )}
                </FormControl>
              </Box>
              {/* Navigation */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mt: 4,
                }}
              >
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    variant="outlined"
                    disabled={currentIdx === 0}
                    onClick={() => setCurrentIdx((idx) => Math.max(0, idx - 1))}
                    sx={{
                      borderRadius: 20,
                      px: 4,
                      py: 1.2,
                      fontWeight: 600,
                      width: "170px",
                      color: "#6b6b6b",
                      borderColor: "#e5e7eb",
                      bgcolor: "#f3f4f6",
                      "&:hover": { bgcolor: "#ede9fe", borderColor: "#a78bfa" },
                    }}
                    startIcon={
                      <span
                        style={{
                          fontSize: 18,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        ⟵
                      </span>
                    }
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outlined"
                    disabled={currentIdx === questions.length - 1}
                    onClick={() =>
                      setCurrentIdx((idx) =>
                        Math.min(questions.length - 1, idx + 1)
                      )
                    }
                    sx={{
                      borderRadius: 20,
                      px: 4,
                      py: 1.2,
                      width: "170px",
                      fontWeight: 600,
                      color: "#6b6b6b",
                      borderColor: "#e5e7eb",
                      bgcolor: "#f3f4f6",
                      "&:hover": { bgcolor: "#ede9fe", borderColor: "#a78bfa" },
                    }}
                    endIcon={
                      <span
                        style={{
                          fontSize: 18,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        ⟶
                      </span>
                    }
                  >
                    Next
                  </Button>
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{
                    borderRadius: 20,
                    px: 6,
                    py: 1.2,
                    fontWeight: 700,
                    bgcolor: "#7c3aed",
                    "&:hover": { bgcolor: "#6d28d9" },
                    fontSize: 18,
                  }}
                >
                  Finish
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ExamProcessView;
