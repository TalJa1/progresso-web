import { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { getQuestionsWithAnswersByExamId } from "../../apis/lessons/QuestionAnswerAPI";
import { getSubmissionRecordsBySubmissionAndUser } from "../../apis/lessons/submissionRecordAPI";
import { getUserByEmail } from "../../apis/users/usersAPI";
import type {
  QuestionModel,
  SubmissionRecordModel,
} from "../../services/apiModel";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
// ...existing imports
import { motion, AnimatePresence } from "framer-motion";
import CircularProgress from "@mui/material/CircularProgress";

const ExamRecordView = () => {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const search = new URLSearchParams(location.search);
  const queryParams: Record<string, string> = {};
  search.forEach((value, key) => {
    queryParams[key] = value;
  });

  const examId = params.examId ?? queryParams.examId ?? null;

  type QuestionWithSelected = QuestionModel & { selected?: string | string[] };
  const [questions, setQuestions] = useState<QuestionWithSelected[]>([]);
  const [submissionRecords, setSubmissionRecords] = useState<
    SubmissionRecordModel[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [direction, setDirection] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const finishTimeout = useRef<number | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);
      try {
        if (examId) {
          const data = await getQuestionsWithAnswersByExamId(Number(examId));

          // initialize selections
          const initQuestions: QuestionWithSelected[] = data.map(
            (q: QuestionModel) => ({
              ...q,
              selected: q.type === "multiple" ? [] : "",
            })
          );

          // if submissionId and user info available, fetch user's submission records
          const submissionIdParam = params.submissionId ?? null;
          if (submissionIdParam) {
            const raw = localStorage.getItem("googleUser");
            let userId: number | null = null;
            if (raw) {
              try {
                const parsed = JSON.parse(raw as string);
                const email = parsed?.email;
                if (email) {
                  const user = await getUserByEmail(email);
                  userId = user.id;
                }
              } catch {
                // ignore parse errors
              }
            }

            if (userId) {
              try {
                const records = await getSubmissionRecordsBySubmissionAndUser(
                  Number(submissionIdParam),
                  userId
                );

                // keep records in state for rendering decisions
                setSubmissionRecords(records);

                // map question id -> chosen answer ids (allow multiple records per question)
                const map: Record<number, number[]> = {};
                records.forEach((r) => {
                  if (!map[r.question_id]) map[r.question_id] = [];
                  map[r.question_id].push(r.chosen_answer_id);
                });

                // apply selections to questions
                initQuestions.forEach((q) => {
                  const chosen = map[q.id] || [];
                  if (q.type === "multiple") {
                    q.selected = chosen.map((c) => c.toString());
                  } else {
                    q.selected = chosen.length ? String(chosen[0]) : "";
                  }
                });
              } catch (e) {
                // if records fetch fails, fall back to blank selections
                console.error("Failed to load submission records", e);
              }
            }
          }

          setQuestions(initQuestions);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load questions.");
      }
      setLoading(false);
    };
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId]);

  useEffect(() => {
    return () => {
      if (finishTimeout.current) clearTimeout(finishTimeout.current);
    };
  }, []);

  if (loading) return <div>Loading questions...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  const goToIndex = (newIdx: number, dir: number) => {
    if (isAnimating) return;
    setDirection(dir);
    setIsAnimating(true);
    setCurrentIdx(newIdx);
  };

  const motionVariants = {
    enter: (dir: number) => ({
      x: dir === 1 ? 40 : -40,
      opacity: 0,
      filter: dir === 1 ? "blur(4px)" : "blur(0px)",
      rotateY: dir === -1 ? -8 : 0,
      scale: 0.99,
    }),
    center: {
      x: 0,
      opacity: 1,
      filter: "blur(0px)",
      rotateY: 0,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir === 1 ? -40 : 40,
      opacity: 0,
      filter: dir === 1 ? "blur(4px)" : "blur(0px)",
      rotateY: dir === -1 ? 8 : 0,
      scale: 0.99,
    }),
  };

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
      <Box sx={{ flexDirection: "row", width: "60%", pt: 5, height: "70%" }}>
        {questions.length === 0 ? (
          <Typography>No questions found for this exam.</Typography>
        ) : (
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
                  }}
                >
                  <Typography variant="body2" sx={{ color: "#6b6b6b" }}>
                    Session 1
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Button
                      disabled
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
                      disabled
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
                    component="div"
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
                    {/* {formatTime(timeLeft)} Min */}
                    30:00 Min
                  </Typography>
                </Box>
              </Box>

              <AnimatePresence
                mode="wait"
                onExitComplete={() => setIsAnimating(false)}
              >
                <motion.div
                  key={questions[currentIdx].id}
                  custom={direction}
                  variants={motionVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                  style={{ width: "100%" }}
                >
                  <Box sx={{ mb: 3, px: 15, widows: "100%" }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ color: "#a3a3a3", fontWeight: 600 }}
                      >
                        Question {currentIdx + 1}
                      </Typography>
                    </Box>
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
                                  disabled
                                  checked={
                                    // if submissionRecords available, use them
                                    submissionRecords.some(
                                      (r) =>
                                        r.question_id ===
                                          questions[currentIdx].id &&
                                        r.chosen_answer_id === ans.id
                                    ) ||
                                    (Array.isArray(
                                      questions[currentIdx].selected
                                    ) &&
                                      questions[currentIdx].selected.includes(
                                        ans.id.toString()
                                      ))
                                  }
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
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <Box component="span" sx={{ pr: 1, flex: 1 }}>
                                    {ans.content}
                                  </Box>
                                  {null}
                                </Box>
                              }
                              sx={{
                                mb: 1,
                                width: "100%",
                                mx: 0,
                                display: "flex",
                                alignItems: "center",
                                px: 0,
                                "& .MuiFormControlLabel-label": {
                                  width: "100%",
                                },
                              }}
                            />
                          ))}
                        </>
                      ) : (
                        <RadioGroup
                          name={`question-${questions[currentIdx].id}`}
                          value={questions[currentIdx].selected || ""}
                        >
                          {questions[currentIdx].answers.map((ans) => (
                            <FormControlLabel
                              key={ans.id}
                              value={ans.id.toString()}
                              control={
                                <Radio
                                  disabled
                                  checked={
                                    submissionRecords.some(
                                      (r) =>
                                        r.question_id ===
                                          questions[currentIdx].id &&
                                        r.chosen_answer_id === ans.id
                                    ) ||
                                    questions[currentIdx].selected ===
                                      ans.id.toString()
                                  }
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
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <Box component="span" sx={{ pr: 1, flex: 1 }}>
                                    {ans.content}
                                  </Box>
                                  {null}
                                </Box>
                              }
                              sx={{
                                mb: 1,
                                width: "100%",
                                mx: 0,
                                display: "flex",
                                alignItems: "center",
                                px: 0,
                                "& .MuiFormControlLabel-label": {
                                  width: "100%",
                                },
                              }}
                            />
                          ))}
                        </RadioGroup>
                      )}
                    </FormControl>
                  </Box>
                </motion.div>
              </AnimatePresence>

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
                    disabled={currentIdx === 0 || isAnimating}
                    onClick={() => goToIndex(Math.max(0, currentIdx - 1), -1)}
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
                    disabled={
                      currentIdx === questions.length - 1 || isAnimating
                    }
                    onClick={() =>
                      goToIndex(
                        Math.min(questions.length - 1, currentIdx + 1),
                        1
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
                <Box>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      if (finishing) return;
                      setFinishing(true);
                      finishTimeout.current = window.setTimeout(() => {
                        navigate(-1);
                      }, 3000);
                    }}
                    disabled={finishing}
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
                    {finishing ? (
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <CircularProgress size={18} sx={{ color: "#fff" }} />
                        Finishing...
                      </Box>
                    ) : (
                      "Finish"
                    )}
                  </Button>
                </Box>
              </Box>
            </>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ExamRecordView;
