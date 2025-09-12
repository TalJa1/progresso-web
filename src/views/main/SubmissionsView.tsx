import HorizontalNavigationBar from "../../components/HorizontalNavigationBar";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Chip,
  LinearProgress,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CommentIcon from "@mui/icons-material/Comment";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getUserByEmail } from "../../apis/users/usersAPI";
import { getSubmissionsByUserId } from "../../apis/lessons/submissionAPI";
import type { SubmissionModel } from "../../services/apiModel";

const SubmissionsView = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionModel[]>([]);
  const navigate = useNavigate();
  const [finishingId, setFinishingId] = useState<number | null>(null);
  const finishTimeout = useRef<number | null>(null);
  // Animation states
  const [animatedCards, setAnimatedCards] = useState<Set<number>>(new Set());
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const googleRaw = localStorage.getItem("googleUser");
        let email: string | null = null;
        if (googleRaw) {
          const parsed = JSON.parse(googleRaw);
          email = parsed?.email || null;
        } else {
          const raw = localStorage.getItem("user");
          if (raw) {
            const parsed = JSON.parse(raw);
            email = parsed?.email || null;
          }
        }
        if (!email) throw new Error("No email available in localStorage");
        const user = await getUserByEmail(email);
        const subs = await getSubmissionsByUserId(user.id);
        setSubmissions(subs || []);
      } catch (err: unknown) {
        const getMsg = (e: unknown) => {
          if (!e) return "";
          if (typeof e === "string") return e;
          if (typeof e === "object" && e !== null && "message" in e)
            return (e as { message: string }).message;
          return String(e);
        };
        setError(getMsg(err) || "Failed to load submissions");
      }
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    return () => {
      if (finishTimeout.current) clearTimeout(finishTimeout.current);
    };
  }, []);

  // Staggered animation effect
  useEffect(() => {
    if (!loading && submissions.length > 0 && !isAnimationComplete) {
      // Reset animated cards
      setAnimatedCards(new Set());

      // Start staggered animation with a small initial delay
      const timeouts: NodeJS.Timeout[] = [];

      const initialTimeout = setTimeout(() => {
        submissions.forEach((submission, index) => {
          const cardTimeout = setTimeout(() => {
            setAnimatedCards((prev) => new Set([...prev, submission.id]));

            // Mark animation as complete when last card is animated
            if (index === submissions.length - 1) {
              const completeTimeout = setTimeout(() => {
                setIsAnimationComplete(true);
              }, 600); // Match animation duration
              timeouts.push(completeTimeout);
            }
          }, index * 150); // 150ms delay between each card
          timeouts.push(cardTimeout);
        });
      }, 300); // Initial delay before starting animations
      timeouts.push(initialTimeout);

      // Cleanup function
      return () => {
        timeouts.forEach((timeout) => clearTimeout(timeout));
      };
    }
  }, [loading, submissions, isAnimationComplete]);

  // Reset animation when component mounts
  useEffect(() => {
    setAnimatedCards(new Set());
    setIsAnimationComplete(false);
  }, []);

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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 2,
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <h2>Progresso Submissions</h2>
          <Chip
            label={`${submissions.length ?? 0}`}
            color="default"
            size="medium"
          />
        </Box>

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
              py: 8,
            }}
          >
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : submissions.length === 0 ? (
          <Typography>No submissions found.</Typography>
        ) : (
          <Box sx={{ display: "grid", gap: 2, width: "100%" }}>
            {submissions.map((s) => {
              const grade = Number(s.grade) || 0;
              const pct = Math.max(0, Math.min(100, (grade / 10) * 100));
              const getProgressColor = (g: number) => {
                if (g <= 4.99) return "#ef4444"; // red
                if (g <= 7) return "#f59e0b"; // amber
                return "#16a34a"; // green
              };
              const upload = new Date(s.upload_time || "");
              const dateStr = isNaN(upload.getTime())
                ? "-"
                : upload.toLocaleDateString();
              const timeStr = isNaN(upload.getTime())
                ? "-"
                : upload.toLocaleTimeString();
              return (
                <Paper
                  key={s.id}
                  className={
                    isAnimationComplete
                      ? "submission-card-visible"
                      : animatedCards.has(s.id)
                      ? "submission-card-animate"
                      : "submission-card-hidden"
                  }
                  sx={{
                    p: 2,
                    borderRadius: 8,
                    position: "relative",
                    bgcolor: "transparent",
                    background:
                      "linear-gradient(135deg, rgba(99,102,241,0.04), rgba(167,139,250,0.04))",
                    backdropFilter: "blur(6px)",
                    boxShadow: "0 8px 24px rgba(79,70,229,0.06)",
                    transition: "box-shadow 0.2s",
                    "&:hover": {
                      boxShadow: "0 12px 32px 0 rgba(15, 36, 227, 0.2)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 2,
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography sx={{ fontWeight: 700 }}>
                          Submission For
                        </Typography>
                        <Chip
                          label={`Exam ${s.exam_id}`}
                          size="small"
                          sx={{
                            bgcolor: "rgba(79,70,229,0.08)",
                            color: "#4f46e5",
                            fontWeight: 700,
                          }}
                        />
                      </Stack>

                      <Box sx={{ mt: 1 }}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={pct}
                              sx={{
                                height: 12,
                                borderRadius: 8,
                                bgcolor: "rgba(99,102,241,0.08)",
                                "& .MuiLinearProgress-bar": {
                                  bgcolor: getProgressColor(grade),
                                },
                              }}
                            />
                          </Box>
                          <Typography
                            sx={{
                              minWidth: 48,
                              textAlign: "right",
                              fontWeight: 700,
                            }}
                          >
                            {grade.toFixed(2)}
                          </Typography>
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          mt: 1,
                          boxShadow: "0 6px 18px rgba(13, 27, 62, 0.06)",
                          borderRadius: 1,
                          p: 1,
                        }}
                      >
                        <Typography sx={{ color: "#374151", fontWeight: 600 }}>
                          Feedback
                        </Typography>
                        <Typography
                          sx={{ color: "#6b6b6b", whiteSpace: "pre-wrap" }}
                        >
                          {s.feedback || "-"}
                        </Typography>
                      </Box>

                      <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                        <Tooltip title="View details">
                          <span style={{ display: "inline-block" }}>
                            <IconButton size="small" disabled>
                              <InsertDriveFileIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Comment">
                          <span style={{ display: "inline-block" }}>
                            <IconButton size="small" disabled>
                              <CommentIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Review">
                          <IconButton
                            size="small"
                            disabled={finishingId !== null}
                            onClick={() => {
                              if (finishingId) return;
                              setFinishingId(s.id);
                              finishTimeout.current = window.setTimeout(() => {
                                navigate(`/exam-record/${s.id}/${s.exam_id}`);
                              }, 3000);
                            }}
                          >
                            {finishingId === s.id ? (
                              <CircularProgress size={16} />
                            ) : (
                              <OpenInNewIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    <Box sx={{ width: 140, textAlign: "right", ml: 2 }}>
                      <Typography variant="caption" sx={{ color: "#6b6b6b" }}>
                        Uploaded
                      </Typography>
                      <Typography sx={{ fontWeight: 700 }}>
                        {dateStr}
                      </Typography>
                      <Typography sx={{ color: "#6b6b6b" }}>
                        {timeStr}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              );
            })}
          </Box>
        )}
      </Box>

      {/* CSS Animations */}
      <style>{`
        @keyframes blurToNormal {
          0% {
            filter: blur(10px);
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          100% {
            filter: blur(0px);
            opacity: 1;
            transform: translateY(0px) scale(1);
          }
        }
        
        .submission-card-hidden {
          filter: blur(10px);
          opacity: 0;
          transform: translateY(20px) scale(0.95);
        }
        
        .submission-card-animate {
          animation: blurToNormal 0.6s ease-out forwards;
        }
        
        .submission-card-visible {
          filter: blur(0px);
          opacity: 1;
          transform: translateY(0px) scale(1);
          transition: all 0.2s ease;
        }
      `}</style>
    </Box>
  );
};

export default SubmissionsView;
