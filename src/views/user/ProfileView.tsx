import HorizontalNavigationBar from "../../components/HorizontalNavigationBar";
import { useEffect, useState } from "react";
import { getUserByEmail } from "../../apis/users/usersAPI";
import { updateUser } from "../../apis/users/usersAPI";
import type { UserModel } from "../../services/apiModel";
import { Box } from "@mui/material";
import { Typography, Button, Avatar, CircularProgress } from "@mui/material";
import TextField from "@mui/material/TextField";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import EditIcon from "@mui/icons-material/Edit";
import SchoolIcon from "@mui/icons-material/School";

const ProfileView = () => {
  const [editDesc, setEditDesc] = useState(false);
  const [descValue, setDescValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });
  const [user, setUser] = useState<UserModel | null>(null);
  useEffect(() => {
    const googleUser = localStorage.getItem("googleUser");
    if (googleUser) {
      try {
        const parsed = JSON.parse(googleUser);
        const email = parsed.email;
        if (email) {
          getUserByEmail(email)
            .then(setUser)
            .catch(() => setUser(null));
        }
      } catch {
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      setDescValue(user.self_description || "");
    }
  }, [user]);

  // Placeholder values for demo
  const profileCompletion = 100;
  const resumeUrl = "#";
  const education = {
    degree: "Student",
    school: `${user?.school} - ${user?.class_ || ""}`,
    years: "now",
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
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 4,
            p: 3,
            bgcolor: "white",
            borderRadius: 3,
            boxShadow: 2,
            width: "100%",
            mb: 3,
            flexDirection: { xs: "column", sm: "column", md: "row" },
            textAlign: { xs: "center", sm: "center", md: "left" },
            alignItems: { xs: "center", sm: "center", md: "center" },
          }}
        >
          <Box sx={{ position: "relative", width: 120, height: 120 }}>
            <CircularProgress
              variant="determinate"
              value={profileCompletion}
              size={120}
              thickness={4}
              sx={{ color: "#43c463" }}
            />
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 120,
                height: 120,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Avatar
                src={user?.avatar_url}
                sx={{ width: 90, height: 90, fontSize: 36 }}
              >
                {user?.full_name?.[0]}
              </Avatar>
              <Box
                sx={{
                  position: "absolute",
                  bottom: 12,
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              >
                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    bgcolor: "#43c463",
                    minWidth: 0,
                    px: 2,
                    fontWeight: 700,
                    fontSize: 14,
                    borderRadius: 3,
                  }}
                >
                  {profileCompletion}%
                </Button>
              </Box>
            </Box>
          </Box>
          <Box sx={{ flex: 1, width: "100%", pt: { xs: 2, sm: 2, md: 0 } }}>
            <Typography variant="h5" sx={{ fontWeight: 900 }}>
              {user?.full_name || "User"}
            </Typography>

            <Typography variant="body1" sx={{ color: "grey.700", mt: 1 }}>
              {user?.email}
            </Typography>
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                disabled
                size="small"
                sx={{ fontWeight: 700, borderRadius: 2 }}
              >
                Edit Personal Details
              </Button>
              <Button
                variant="outlined"
                disabled
                size="small"
                sx={{ fontWeight: 700, borderRadius: 2 }}
                startIcon={<UploadFileIcon />}
                href={resumeUrl}
              >
                Upload Resume
              </Button>
            </Box>
          </Box>
        </Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            mt: 3,
            mb: 2,
            textAlign: "left",
            width: "100%",
          }}
        >
          Work Experience
        </Typography>
        <Box
          sx={{
            bgcolor: "white",
            borderRadius: 3,
            boxShadow: 2,
            p: 3,
            width: "100%",
            mb: 3,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mt: 3,
              mb: 2,
              textAlign: "left",
              width: "100%",
            }}
          >
            Self Description
          </Typography>
          {editDesc ? (
            <TextField
              fullWidth
              multiline
              minRows={3}
              value={descValue}
              onChange={(e) => setDescValue(e.target.value)}
              disabled={loading}
              sx={{ mb: 2 }}
              placeholder="Enter your self description..."
            />
          ) : (
            <Typography variant="body1" sx={{ color: "grey.800", mb: 2 }}>
              {user?.self_description || "No description provided."}
            </Typography>
          )}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            {editDesc ? (
              <Button
                variant="contained"
                size="small"
                sx={{ fontWeight: 700, borderRadius: 2, minWidth: 100 }}
                disabled={loading}
                onClick={async () => {
                  if (!user) return;
                  setLoading(true);
                  try {
                    await updateUser(user.id, {
                      email: user.email,
                      full_name: user.full_name,
                      avatar_url: user.avatar_url,
                      class_: user.class_,
                      school: user.school,
                      self_description: descValue,
                    });
                    setSnackbar({
                      open: true,
                      message: "Updated successfully!",
                      severity: "success",
                    });
                    setUser({ ...user, self_description: descValue });
                    setEditDesc(false);
                  } catch {
                    setSnackbar({
                      open: true,
                      message: "Update failed!",
                      severity: "error",
                    });
                  }
                  setLoading(false);
                }}
              >
                {loading ? "Applying..." : "Apply"}
              </Button>
            ) : (
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon />}
                sx={{ fontWeight: 700, borderRadius: 2 }}
                onClick={() => setEditDesc(true)}
              >
                Edit
              </Button>
            )}
          </Box>
        </Box>
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          <MuiAlert elevation={6} variant="filled" severity={snackbar.severity}>
            {snackbar.message}
          </MuiAlert>
        </Snackbar>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            mt: 3,
            mb: 2,
            textAlign: "left",
            width: "100%",
          }}
        >
          Education
        </Typography>
        <Box
          sx={{
            bgcolor: "white",
            borderRadius: 3,
            boxShadow: 2,
            p: 3,
            width: "100%",
            mb: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              maxWidth: 900,
            }}
          >
            <SchoolIcon sx={{ color: "#e88c2b", fontSize: 32 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {education.degree}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: "grey.700", ml: 5 }}>
            {education.school}
          </Typography>
          <Typography variant="body2" sx={{ color: "grey.700", ml: 5 }}>
            {education.years}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ProfileView;
