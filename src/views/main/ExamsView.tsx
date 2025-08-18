import HorizontalNavigationBar from "../../components/HorizontalNavigationBar";
import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Slide from "@mui/material/Slide";
import Avatar from "@mui/material/Avatar";
import type { TransitionProps } from "@mui/material/transitions";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllExams } from "../../apis/lessons/examAPI";
import type { ExamModel } from "../../services/apiModel";
import { Chip, Tooltip } from "@mui/material";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const ExamsView = () => {
  const [exams, setExams] = useState<ExamModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedExam, setSelectedExam] = useState<ExamModel | null>(null);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [redirectText, setRedirectText] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExams = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllExams();
        setExams(data);
      } catch {
        setError("Failed to load exams.");
      }
      setLoading(false);
    };
    fetchExams();
  }, []);

  const handleTakeExam = (exam: ExamModel) => {
    setSelectedExam(exam);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    if (!dialogLoading) {
      setOpenDialog(false);
      setSelectedExam(null);
      setRedirectText("");
    }
  };

  const handleDialogConfirm = () => {
    setDialogLoading(true);
    setRedirectText("");
    setTimeout(() => {
      setRedirectText("Redirecting to exam...");
      setTimeout(() => {
        if (selectedExam) {
          navigate(`/exam-process/${selectedExam.id}`);
        }
        setDialogLoading(false);
        setOpenDialog(false);
        setSelectedExam(null);
        setRedirectText("");
      }, 2000);
    }, 3000);
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
      <Box
        sx={{
          width: { xs: "98%", sm: "90%", md: "80%", lg: "70%", xl: "1300px" },
          maxWidth: 1300,
          mx: "auto",
          pt: 4,
          pb: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <h2>Progresso Exams</h2>
        </Box>
        {loading ? (
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              mt: 6,
            }}
          >
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" sx={{ mt: 4 }}>
            {error}
          </Typography>
        ) : (
          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            {exams.map((exam) => (
              <Box
                key={exam.id}
                sx={{
                  width: "100%",
                  bgcolor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 2,
                  boxShadow: "0 6px 24px 0 rgba(59,79,255,0.16)",
                  p: 2.5,
                  mb: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                  transition: "box-shadow 0.2s",
                  "&:hover": {
                    boxShadow: "0 12px 32px 0 rgba(15, 36, 227, 0.2)",
                  },
                }}
              >
                {/* Top Row: Exam ID and Status */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, color: "#222", fontSize: 16 }}
                  >
                    Exam ID: {exam.id}
                  </Typography>
                  <Box
                    sx={{
                      bgcolor: "#22c55e",
                      color: "#fff",
                      px: 2,
                      py: 0.5,
                      borderRadius: 1,
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    Published
                  </Box>
                </Box>
                {/* Breadcrumb Row */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    flexWrap: "wrap",
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: "#6b7280", fontSize: 14 }}
                  >
                    Year: {exam.year}
                  </Typography>
                  <Box
                    sx={{
                      width: 4,
                      height: 4,
                      bgcolor: "#d1d5db",
                      borderRadius: "50%",
                      mx: 1,
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ color: "#6b7280", fontSize: 14 }}
                  >
                    Province: {exam.province}
                  </Typography>
                  <Box
                    sx={{
                      width: 4,
                      height: 4,
                      bgcolor: "#d1d5db",
                      borderRadius: "50%",
                      mx: 1,
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ color: "#6b7280", fontSize: 14 }}
                  >
                    Topic ID: {exam.topic_id}
                  </Typography>
                </Box>
                {/* Main Title */}
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "#3b4fff",
                    fontSize: 20,
                    mb: 1,
                  }}
                >
                  {exam.name}
                </Typography>
                {/* Info Row (mocked for now) */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    flexWrap: "wrap",
                    mb: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Typography
                      variant="body2"
                      sx={{ color: "#222", fontWeight: 500, fontSize: 15 }}
                    >
                      Rating:
                    </Typography>
                    {/* Star icons (static 4/5 for demo) */}
                    <Box
                      sx={{
                        color: "#fbbf24",
                        display: "flex",
                        alignItems: "center",
                        ml: 0.5,
                      }}
                    >
                      <span style={{ fontSize: 18, marginRight: 1 }}>
                        {exam.rating} ★
                      </span>
                    </Box>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{ color: "#222", fontSize: 15 }}
                  >
                    Student Attempted:{" "}
                    <Chip color="default" label={exam.student_attempt || 0} />
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {(() => {
                      const pct = Math.max(
                        0,
                        Math.min(100, Number(exam.correct_attempt || 0))
                      );
                      const getColor = (p: number) => {
                        if (p <= 50) return "#ef4444";
                        if (p <= 70) return "#f59e0b";
                        return "#16a34a";
                      };
                      const color = getColor(pct);
                      return (
                        <Tooltip title="attempt correct">
                          <Box
                            sx={{
                              position: "relative",
                              display: "inline-flex",
                              width: 56,
                              height: 56,
                            }}
                          >
                            <CircularProgress
                              variant="determinate"
                              value={pct}
                              size={56}
                              thickness={6}
                              sx={{ color }}
                            />
                            <Box
                              sx={{
                                top: 0,
                                left: 0,
                                bottom: 0,
                                right: 0,
                                position: "absolute",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{ fontWeight: 700 }}
                              >
                                {pct}%
                              </Typography>
                            </Box>
                          </Box>
                        </Tooltip>
                      );
                    })()}
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{ color: "#222", fontSize: 15 }}
                  >
                    Added on: {exam.added_on || ""}
                  </Typography>
                </Box>
                {/* Action Row */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    mt: 1,
                  }}
                >
                  <Button
                    variant="outlined"
                    sx={{
                      borderColor: "#3b4fff",
                      color: "#3b4fff",
                      borderRadius: 2,
                      fontWeight: 700,
                      px: 3,
                      py: 1.2,
                      textTransform: "none",
                      boxShadow: "none",
                      fontSize: 15,
                      "&:hover": { bgcolor: "#f3f4f6", borderColor: "#1e1b4b" },
                    }}
                    onClick={() => handleTakeExam(exam)}
                  >
                    Take Exam
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        TransitionComponent={Transition}
        keepMounted
        aria-describedby="exam-confirmation-dialog"
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 2,
            minWidth: 340,
            boxShadow: 3,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            pt: 2,
            px: 2,
          }}
        >
          <Avatar sx={{ bgcolor: "#1976d2", width: 48, height: 48, mb: 1 }}>
            <Typography variant="h4" sx={{ color: "#fff", fontWeight: 700 }}>
              ?
            </Typography>
          </Avatar>
          <DialogTitle
            sx={{
              textAlign: "center",
              fontWeight: 700,
              fontSize: 22,
              p: 0,
              mb: 0.5,
              lineHeight: 1.2,
            }}
            component="div"
          >
            Do you want to take this exam?
          </DialogTitle>
          <DialogContent sx={{ p: 0, mt: 0.5, mb: 1 }}>
            <DialogContentText
              id="exam-confirmation-dialog"
              sx={{
                textAlign: "center",
                color: "#757575",
                fontSize: 18,
                fontWeight: 500,
                mb: 0,
                letterSpacing: 0.1,
              }}
            >
              {selectedExam?.name}
            </DialogContentText>
            {redirectText && (
              <Typography
                sx={{
                  mt: 2,
                  color: "green",
                  fontWeight: 500,
                  textAlign: "center",
                }}
              >
                {redirectText}
              </Typography>
            )}
          </DialogContent>
        </Box>
        <DialogActions sx={{ justifyContent: "center", pb: 2, pt: 0 }}>
          <Button
            onClick={handleDialogClose}
            variant="outlined"
            color="inherit"
            disabled={dialogLoading}
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              px: 3,
              py: 1,
              fontSize: 15,
              mr: 1.5,
              borderColor: "#d1d5db",
              color: "#222",
              "&:hover": { bgcolor: "#f3f4f6", borderColor: "#1e1b4b" },
            }}
          >
            CANCEL
          </Button>
          <Button
            onClick={handleDialogConfirm}
            color="primary"
            variant="contained"
            disabled={dialogLoading}
            startIcon={
              dialogLoading ? (
                <CircularProgress size={18} color="inherit" />
              ) : null
            }
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              px: 3,
              py: 1,
              fontSize: 15,
              bgcolor: "#1976d2",
              "&:hover": { bgcolor: "#1565c0" },
            }}
          >
            {dialogLoading ? "Loading..." : "YES, START"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExamsView;
