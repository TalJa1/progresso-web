import HorizontalNavigationBar from "../../components/HorizontalNavigationBar";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllExams } from "../../apis/lessons/examAPI";
import type { ExamModel } from "../../services/apiModel";

const ExamsView = () => {
  const [exams, setExams] = useState<ExamModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedExam, setSelectedExam] = useState<ExamModel | null>(null);
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
    setOpenDialog(false);
    setSelectedExam(null);
  };

  const handleDialogConfirm = () => {
    if (selectedExam) {
      navigate(`/exam-process/${selectedExam.id}`);
    }
    setOpenDialog(false);
    setSelectedExam(null);
  };

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
                    Student Attempted: {exam.student_attempt || 0}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#222", fontSize: 15 }}
                  >
                    Correct Attempt: {exam.correct_attempt || 0}%
                  </Typography>
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
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Take Exam</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to take the exam "{selectedExam?.name}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleDialogConfirm}
            color="primary"
            variant="contained"
          >
            Yes, Start
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExamsView;
