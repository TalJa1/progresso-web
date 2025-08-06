import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Stack,
  IconButton,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import AppleIcon from "@mui/icons-material/Apple";
import XIcon from "@mui/icons-material/X";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDdrn7V_YfgJYa_hzYRAqYSIC3M1uPcy-E",
  authDomain: "progresso-f52a8.firebaseapp.com",
  projectId: "progresso-f52a8",
  storageBucket: "progresso-f52a8.firebasestorage.app",
  messagingSenderId: "46839112834",
  appId: "1:46839112834:web:e7be21ef827d3a550c009b",
  measurementId: "G-8YMXL59K4R",
};

const app = initializeApp(firebaseConfig);
getAnalytics(app);
const auth = getAuth(app);

const LoginView = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [googleUser, setGoogleUser] = useState<{
    displayName?: string;
    email?: string;
    photoURL?: string;
    uid?: string;
  } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTimeout(() => {
      setLoading(false);
      setError("Demo: Invalid credentials");
    }, 1000);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (result && result.user) {
        console.log("Google login successful:", result.user);
        const userData = {
          displayName: result.user.displayName ?? undefined,
          email: result.user.email ?? undefined,
          photoURL: result.user.photoURL ?? undefined,
          uid: result.user.uid,
        };
        setGoogleUser(userData);
        setError("");
        localStorage.setItem("googleUser", JSON.stringify(userData));
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Google login failed");
      }
    }
    setLoading(false);
  };

  React.useEffect(() => {
    // Load user from localStorage on mount
    const storedUser = localStorage.getItem("googleUser");
    if (storedUser) {
      setGoogleUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          backgroundImage:
            'url("https://res.cloudinary.com/dyhnzac8w/image/upload/v1754451247/paper1_wallpaper_avqflu.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
          bgcolor: "rgba(230, 230, 230, 0.4)",
        }}
      />
      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: "100%" }}>
          <React.Fragment>
            <Typography variant="h5" align="center" gutterBottom>
              Login
            </Typography>
            <Stack
              direction="row"
              spacing={2}
              justifyContent="center"
              sx={{ mb: 2 }}
            >
              <IconButton
                color="primary"
                onClick={handleGoogleLogin}
                disabled={loading}
                aria-label="Login with Google"
              >
                <GoogleIcon fontSize="large" />
              </IconButton>
              <IconButton
                color="inherit"
                disabled
                aria-label="Login with Apple"
              >
                <AppleIcon fontSize="large" />
              </IconButton>
              <IconButton color="inherit" disabled aria-label="Login with X">
                <XIcon fontSize="large" />
              </IconButton>
            </Stack>
            <Box
              component="form"
              onSubmit={handleLogin}
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
              />
              {error && (
                <Typography color="error" variant="body2" align="center">
                  {error}
                </Typography>
              )}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </Box>
          </React.Fragment>
        </Paper>
      </Box>
    </Box>
  );
};

export default LoginView;
