import { useEffect, useState, useRef, forwardRef } from "react";
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
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import DialogContentText from "@mui/material/DialogContentText";
import { chatWithGemini } from "../../apis/aichatApi";
import { createSubmission } from "../../apis/lessons/submissionAPI";
import { createSubmissionRecordBatch } from "../../apis/lessons/submissionRecordAPI";
import type { SubmissionRecordModelCreate } from "../../services/apiModel";
import { getUserByEmail } from "../../apis/users/usersAPI";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Slide from "@mui/material/Slide";
import type { SlideProps } from "@mui/material/Slide";
import type { TransitionProps } from "@mui/material/transitions";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

const Transition = forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement | undefined },
  ref: React.ForwardedRef<unknown>
) {
  return (
    <Slide direction="up" ref={ref} {...(props as unknown as SlideProps)} />
  );
});
import { motion, AnimatePresence } from "framer-motion";

const ExamProcessView = () => {
  const { examId } = useParams<{ examId: string }>();
  type QuestionWithSelected = QuestionModel & { selected?: string | string[] };
  const [questions, setQuestions] = useState<QuestionWithSelected[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [direction, setDirection] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [questionCorrect, setQuestionCorrect] = useState<
    Record<number, boolean>
  >({});
  const [aiOpen, setAiOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const navigate = useNavigate();

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

  const computeScore = useRef<() => void | null>(null);
  computeScore.current = () => {
    if (submitted) return;
    let total = 0;
    const resultMap: Record<number, boolean> = {};
    questions.forEach((q) => {
      const answers = q.answers || [];
      if (q.type === "multiple") {
        const correctIds = answers
          .filter((a) => a.is_correct)
          .map((a) => a.id.toString());
        const numCorrect = correctIds.length;
        if (numCorrect === 0) return;
        const selectedArr: string[] = Array.isArray(q.selected)
          ? q.selected
          : q.selected
          ? [q.selected as string]
          : [];
        const correctSelectedCount = selectedArr.filter((id) =>
          correctIds.includes(id)
        ).length;
        total += correctSelectedCount / numCorrect;
        const allCorrectSelected =
          selectedArr.length === correctIds.length &&
          correctIds.every((cid) => selectedArr.includes(cid));
        resultMap[q.id] = allCorrectSelected;
      } else {
        const selected =
          typeof q.selected === "string"
            ? q.selected
            : Array.isArray(q.selected) && q.selected.length
            ? q.selected[0]
            : "";
        const isCorrect = answers.some(
          (a) => a.is_correct && a.id.toString() === selected
        );
        if (isCorrect) {
          total += 1;
        }
        resultMap[q.id] = isCorrect;
      }
    });
    setScore(Number(total.toFixed(2)));
    setQuestionCorrect(resultMap);
    setSubmitted(true);
  };

  useEffect(() => {
    if (timeLeft === 0 && !submitted && computeScore.current) {
      computeScore.current();
    }
  }, [timeLeft, submitted, computeScore]);

  useEffect(() => {
    if (submitted) {
      setShowConfirm(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [submitted]);
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
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

  const getAiText = () => {
    if (!aiResponse) return "";
    try {
      const parsed = JSON.parse(aiResponse);
      if (
        parsed &&
        typeof parsed === "object" &&
        "reply" in (parsed as Record<string, unknown>)
      ) {
        const r = (parsed as Record<string, unknown>)["reply"];
        return typeof r === "string" ? r : JSON.stringify(r, null, 2);
      }
    } catch {
      // not JSON, fall through
    }
    return aiResponse;
  };

  if (loading) return <div>Loading questions...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  const goToIndex = (newIdx: number, dir: number) => {
    if (isAnimating) return;
    setDirection(dir);
    setIsAnimating(true);
    setCurrentIdx(newIdx);
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
      {submitted && (
        <motion.div
          initial={{ x: 200, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          style={{ position: "fixed", top: 24, right: 24, zIndex: 1400 }}
        >
          <Box
            sx={{
              bgcolor: "#fff",
              px: 3,
              py: 1.5,
              borderRadius: 2,
              boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Your Score
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 900, color: "#7c3aed" }}>
              {score}
            </Typography>
            <Typography variant="body2" sx={{ color: "#9ca3af" }}>
              / {questions.length}
            </Typography>
          </Box>
        </motion.div>
      )}
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
                    {formatTime(timeLeft)} Min
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
                      {submitted &&
                      questionCorrect[questions[currentIdx].id] === false ? (
                        <Tooltip title="Ask AI for explanation">
                          <IconButton
                            size="small"
                            color="default"
                            onClick={async () => {
                              setAiLoading(true);
                              setAiError(null);
                              setAiResponse(null);
                              setAiOpen(true);
                              try {
                                const parts: string[] = [];
                                const q = questions[currentIdx];
                                if (!q) {
                                  setAiError("Question not available");
                                  return;
                                }
                                parts.push(`Q${currentIdx + 1}: ${q.content}`);
                                q.answers.forEach((a) => {
                                  const selected = Array.isArray(q.selected)
                                    ? q.selected.includes(a.id.toString())
                                    : q.selected === a.id.toString();
                                  parts.push(
                                    `- ${a.content}${
                                      selected ? " (selected)" : ""
                                    }`
                                  );
                                });
                                parts.push("Answer and explain in very short");
                                const message = parts.join("\n");
                                const res = await chatWithGemini(message);
                                setAiResponse(
                                  typeof res === "string"
                                    ? res
                                    : JSON.stringify(res)
                                );
                              } catch (e: unknown) {
                                let msg: string;
                                if (e instanceof Error) msg = e.message;
                                else msg = String(e);
                                setAiError(msg || "AI request failed");
                              } finally {
                                setAiLoading(false);
                              }
                            }}
                          >
                            <SmartToyIcon />
                          </IconButton>
                        </Tooltip>
                      ) : null}
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
                                  disabled={submitted}
                                  checked={
                                    Array.isArray(
                                      questions[currentIdx].selected
                                    ) &&
                                    questions[currentIdx].selected.includes(
                                      ans.id.toString()
                                    )
                                  }
                                  onChange={(_, checked) => {
                                    setQuestions((prev) =>
                                      prev.map((q, idx) => {
                                        if (idx !== currentIdx) return q;
                                        let selectedArr = Array.isArray(
                                          q.selected
                                        )
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
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <Box component="span" sx={{ pr: 1, flex: 1 }}>
                                    {ans.content}
                                  </Box>
                                  {submitted &&
                                  Array.isArray(
                                    questions[currentIdx].selected
                                  ) &&
                                  questions[currentIdx].selected.includes(
                                    ans.id.toString()
                                  ) ? (
                                    ans.is_correct ? (
                                      <CheckCircleOutlineIcon
                                        sx={{ color: "#16a34a", ml: 2 }}
                                      />
                                    ) : (
                                      <CancelOutlinedIcon
                                        sx={{ color: "#ef4444", ml: 2 }}
                                      />
                                    )
                                  ) : null}
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
                          onChange={(_, value) => {
                            setQuestions((prev) =>
                              prev.map((q, idx) =>
                                idx === currentIdx
                                  ? { ...q, selected: value }
                                  : q
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
                                  disabled={submitted}
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
                                  {submitted &&
                                  questions[currentIdx].selected ===
                                    ans.id.toString() ? (
                                    ans.is_correct ? (
                                      <CheckCircleOutlineIcon
                                        sx={{ color: "#16a34a", ml: 2 }}
                                      />
                                    ) : (
                                      <CancelOutlinedIcon
                                        sx={{ color: "#ef4444", ml: 2 }}
                                      />
                                    )
                                  ) : null}
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
                    onClick={() => setShowConfirm(true)}
                    disabled={submitted}
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
                  {submitted && (
                    <Button
                      variant="outlined"
                      color="primary"
                      sx={{ ml: 2, borderRadius: 20, px: 3, py: 1.2 }}
                      onClick={async () => {
                        // get user id from local storage email like other parts of app
                        const raw = localStorage.getItem("googleUser");
                        if (!raw) return;
                        try {
                          const parsed = JSON.parse(raw as string);
                          const email = parsed?.email;
                          if (!email) return;
                          const user = await getUserByEmail(email);
                          const scFloat = Number(score ?? 0);
                          const idx = Math.max(
                            0,
                            Math.min(10, Math.floor(scFloat))
                          );
                          const feedbackMessages: Record<number, string> = {
                            0: "No correct answers — start with the basics. Revisit lecture notes and attempt simple practice problems to build confidence.",
                            1: "Very early progress — focus on core definitions and simple examples. One-step problems first, then increase complexity.",
                            2: "Basic understanding — continue practicing problem types you got wrong and review solution steps to identify common mistakes.",
                            3: "Developing skills — you're getting there; target weak topics and do timed drills to build speed.",
                            4: "Partial mastery — many concepts are understood but accuracy is inconsistent; practise mixed problem sets.",
                            5: "Moderate competence — solid foundational skills; work on precision and handling edge-case questions.",
                            6: "Above average — good performance; refine methods and practice under time pressure to raise consistency.",
                            7: "Strong performance — you understand most material; polish techniques and review occasional mistakes for full mastery.",
                            8: "Very strong — accurate and confident on many problems; focus on advanced problems and speed optimization.",
                            9: "Excellent — near mastery. Keep revising tricky problems and maintain consistency under timed conditions.",
                            10: "Outstanding — full mastery demonstrated. Consider mentoring peers or tackling extension/challenge problems to stay sharp.",
                          };
                          const feedback =
                            feedbackMessages[idx] ??
                            "No answers submitted or score unavailable.";

                          const payload = {
                            user_id: user.id,
                            exam_id: Number(examId) || 0,
                            grade: score ?? 0,
                            feedback,
                          };
                          // create submission first to get submission id
                          const created = await createSubmission(payload);

                          try {
                            // build submission records from user selections
                            const records: SubmissionRecordModelCreate[] = [];
                            questions.forEach((q) => {
                              if (q.type === "multiple") {
                                const selectedArr: string[] = Array.isArray(q.selected)
                                  ? q.selected
                                  : q.selected
                                  ? [q.selected as string]
                                  : [];
                                selectedArr.forEach((sel) => {
                                  const aid = Number(sel);
                                  if (!Number.isNaN(aid)) {
                                    records.push({
                                      submission_id: created.id,
                                      user_id: user.id,
                                      question_id: q.id,
                                      chosen_answer_id: aid,
                                    });
                                  }
                                });
                              } else {
                                const sel = typeof q.selected === "string" ? q.selected : Array.isArray(q.selected) && q.selected.length ? q.selected[0] : "";
                                const aid = Number(sel || 0);
                                if (!Number.isNaN(aid) && aid !== 0) {
                                  records.push({
                                    submission_id: created.id,
                                    user_id: user.id,
                                    question_id: q.id,
                                    chosen_answer_id: aid,
                                  });
                                }
                              }
                            });

                            if (records.length > 0) {
                              // send batch records
                              await createSubmissionRecordBatch(records);
                            }
                          } catch (e) {
                            // don't block navigation on record failure
                            console.error("Failed to save submission records", e);
                          }

                          navigate("/submissions");
                        } catch (e) {
                          console.error("Submit failed", e);
                        }
                      }}
                    >
                      Submit
                    </Button>
                  )}
                </Box>
                <Dialog
                  open={showConfirm}
                  onClose={() => setShowConfirm(false)}
                  TransitionComponent={Transition}
                  keepMounted
                  fullWidth
                  maxWidth="xs"
                  PaperProps={{ sx: { borderRadius: 3, p: 1.5 } }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      px: 2,
                      pt: 1,
                    }}
                  >
                    <WarningAmberIcon color="warning" sx={{ fontSize: 40 }} />
                    <DialogTitle sx={{ p: 0 }}>Confirm Submission</DialogTitle>
                  </Box>
                  <DialogContent sx={{ pt: 1 }}>
                    <Typography sx={{ color: "#374151" }}>
                      Are you sure you want to submit your answers? You won't be
                      able to change them after submission.
                    </Typography>
                  </DialogContent>
                  <DialogActions sx={{ px: 2, pb: 2 }}>
                    <Button
                      onClick={() => setShowConfirm(false)}
                      color="inherit"
                      sx={{ textTransform: "none" }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        if (computeScore.current) computeScore.current();
                        setShowConfirm(false);
                      }}
                      color="primary"
                      variant="contained"
                      sx={{ textTransform: "none", borderRadius: 2 }}
                    >
                      Submit
                    </Button>
                  </DialogActions>
                </Dialog>

                {/* AI response dialog */}
                <Dialog
                  open={aiOpen}
                  onClose={() => setAiOpen(false)}
                  fullWidth
                  maxWidth="sm"
                  PaperProps={{ sx: { borderRadius: 2 } }}
                >
                  <DialogTitle>AI Explanation</DialogTitle>
                  <DialogContent dividers>
                    {aiLoading ? (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <CircularProgress size={24} />
                        <Typography>Thinking...</Typography>
                      </Box>
                    ) : aiError ? (
                      <DialogContentText sx={{ color: "error.main" }}>
                        {aiError}
                      </DialogContentText>
                    ) : (
                      <Box
                        sx={{
                          "& pre": {
                            background: "#f3f4f6",
                            p: 2,
                            borderRadius: 1,
                          },
                          "& code": {
                            background: "#eef2ff",
                            p: "2px 6px",
                            borderRadius: "6px",
                          },
                        }}
                      >
                        <ReactMarkdown>{getAiText()}</ReactMarkdown>
                      </Box>
                    )}
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setAiOpen(false)} color="primary">
                      Close
                    </Button>
                  </DialogActions>
                </Dialog>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ExamProcessView;
