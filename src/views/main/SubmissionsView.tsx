import HorizontalNavigationBar from "../../components/HorizontalNavigationBar";
import { Box, Typography, Paper, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { getUserByEmail } from "../../apis/users/usersAPI";
import { getSubmissionsByUserId } from "../../apis/lessons/submissionAPI";
import type { SubmissionModel } from "../../services/apiModel";

const SubmissionsView = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionModel[]>([]);

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
          <Typography variant="h4">Submissions</Typography>
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
            {submissions.map((s) => (
              <Paper key={s.id} sx={{ p: 2 }}>
                <Typography sx={{ fontWeight: 700 }}>
                  Submission #{s.id}
                </Typography>
                <Typography>Exam ID: {s.exam_id}</Typography>
                <Typography>Grade: {s.grade}</Typography>
                <Typography>
                  Uploaded: {new Date(s.upload_time).toLocaleString()}
                </Typography>
                <Typography sx={{ color: "#6b6b6b" }}>
                  Feedback: {s.feedback || "-"}
                </Typography>
              </Paper>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default SubmissionsView;
