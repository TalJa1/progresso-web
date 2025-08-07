import React from "react";
import { motion } from "framer-motion";
import { Paper, Box, Typography, IconButton, TextField, Snackbar, Alert } from "@mui/material";
import { createUser } from '../../apis/users/usersAPI';
import type { UserModelCreate } from "../../services/apiModel";

interface WelcomeNewUserProps {
  displayName?: string;
  email?: string;
  photoURL?: string;
  onNext?: () => void;
}

const WelcomeNewUser: React.FC<WelcomeNewUserProps> = ({ displayName, email, photoURL, onNext }) => {
  const [school, setSchool] = React.useState("");
  const [className, setClassName] = React.useState("");
  const [showClassInput, setShowClassInput] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMsg, setSnackbarMsg] = React.useState('');
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<'success' | 'error'>('success');

  React.useEffect(() => {
    if (school.trim().length > 0) {
      setShowClassInput(true);
    } else {
      setShowClassInput(false);
      setClassName("");
    }
  }, [school]);

  const handleCreateUser = async () => {
    if (!email || !displayName) return;
    setLoading(true);
    const user: UserModelCreate = {
      email,
      full_name: displayName,
      avatar_url: photoURL || '',
      class_: className,
      school,
    };
    try {
      await createUser(user);
      setSnackbarMsg('User created successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      if (onNext) onNext();
    } catch (err) {
      setSnackbarMsg('Failed to create user.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      console.error('Failed to create user:', err);
    }
    setLoading(false);
  };

  return (
    <>
      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -400, opacity: 0 }}
        transition={{ type: "spring", stiffness: 80, damping: 20 }}
        style={{
          position: "absolute",
          zIndex: 3,
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          minHeight: "100vh",
          minWidth: "100vw",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            maxWidth: 400,
            width: "100%",
            borderRadius: 4,
            boxShadow: 3,
            bgcolor: "rgba(255,255,255,0.3)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Typography variant="h5" gutterBottom>
              Welcome to Progresso!
            </Typography>
            {photoURL ? (
              <img
                src={photoURL}
                alt="User"
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  marginBottom: 16,
                  objectFit: "cover",
                  background: "#eee",
                }}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://ui-avatars.com/api/?name=User&background=eee&color=555&size=100";
                }}
              />
            ) : (
              <img
                src="https://ui-avatars.com/api/?name=User&background=eee&color=555&size=100"
                alt="User"
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  marginBottom: 16,
                  objectFit: "cover",
                  background: "#eee",
                }}
              />
            )}
            <Typography variant="body1" sx={{ mt: 2, mb: 2, textAlign: "center" }}>
              Please help me to know you well
            </Typography>
            <TextField
              label="School Name"
              value={school}
              onChange={e => setSchool(e.target.value)}
              fullWidth
              size="small"
              sx={{ mt: 1, bgcolor: "grey.100", borderRadius: 2 }}
            />
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={showClassInput ? { y: 0, opacity: 1 } : { y: 80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 80, damping: 20 }}
              style={{ width: "100%" }}
            >
              {showClassInput && (
                <TextField
                  label="Class Name"
                  value={className}
                  onChange={e => setClassName(e.target.value)}
                  fullWidth
                  size="small"
                  sx={{ mt: 2, bgcolor: "grey.100", borderRadius: 2 }}
                />
              )}
            </motion.div>
            <IconButton
              color="primary"
              onClick={handleCreateUser}
              disabled={loading || !school.trim() || !className.trim()}
              sx={{
                mt: 1,
                bgcolor: "grey.100",
                borderRadius: 2,
                boxShadow: 1,
                display: "flex",
                alignSelf: "flex-end",
                paddingInline: 5,
              }}
              aria-label="Next"
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
            </IconButton>
          </Box>
        </Paper>
      </motion.div>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert severity={snackbarSeverity} onClose={() => setSnackbarOpen(false)} sx={{ width: '100%' }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </>
  );
};

export default WelcomeNewUser;
