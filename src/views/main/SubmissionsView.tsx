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
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    position: "relative",
                    bgcolor: "transparent",
                    background:
                      "linear-gradient(135deg, hsla(0, 0%, 78%, 0.1), rgba(81, 81, 81, 0.2))",
                    backdropFilter: "blur(6px)",
                    boxShadow: "0 6px 20px rgba(16,24,40,0.06)",
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
                          color="success"
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
                                bgcolor: "rgba(0,0,0,0.06)",
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
                          <IconButton size="small" disabled>
                            <InsertDriveFileIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Comment">
                          <IconButton size="small" disabled>
                            <CommentIcon fontSize="small" />
                          </IconButton>
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
    </Box>
  );
};

export default SubmissionsView;
