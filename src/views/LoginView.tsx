import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Stack,
  IconButton,
} from "@mui/material";
// import GoogleIcon from "@mui/icons-material/Google";
import googleLogo from "../assets/google-logo.png";
import AppleIcon from "@mui/icons-material/Apple";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import logo from "../assets/progresso-logo.png";
import { getUserByEmail } from "../apis/users/usersAPI";
import WelcomeNewUser from "../components/login/WelcomeNewUser";
import { useNavigate } from 'react-router-dom';

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
  const [showSuccess, setShowSuccess] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState<boolean | null>(null);
  const [showWelcomeNewUser, setShowWelcomeNewUser] = useState(false);
  const navigate = useNavigate();

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
        // Check if user exists in DB
        if (userData.email) {
          try {
            const dbUser = await getUserByEmail(userData.email);
            if (dbUser) {
              setIsExistingUser(true);
            } else {
              setIsExistingUser(false);
            }
          } catch {
            setIsExistingUser(false);
          }
        }
        setTimeout(() => setShowSuccess(true), 400); // delay for animation
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
        width: "100vw",
        height: "100vh",
        minHeight: "100vh",
        minWidth: "100vw",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
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
          width: "100vw",
          height: "100vh",
          zIndex: 1,
          bgcolor: "rgba(230, 230, 230, 0.4)",
        }}
      />
      <AnimatePresence>
        {!showSuccess && (
          <motion.div
            initial={{ y: 0, opacity: 1 }}
            animate={{ y: showSuccess ? 400 : 0, opacity: showSuccess ? 0 : 1 }}
            exit={{ y: 400, opacity: 0 }}
            transition={{ type: "spring", stiffness: 80, damping: 20 }}
            style={{
              position: "absolute",
              zIndex: 2,
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
                <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                  <img
                    src={logo}
                    alt="Progresso Logo"
                    style={{
                      width: 56,
                      height: 56,
                      marginBottom: 8,
                      borderRadius: 16,
                      background: "#f6f6f6",
                      boxShadow: "0 2px 8px #eee",
                    }}
                  />
                </Box>
                <Typography
                  variant="h6"
                  align="center"
                  sx={{ fontWeight: 700, mb: 0.5 }}
                >
                  Sign in with email
                </Typography>
                <Typography
                  variant="body2"
                  align="center"
                  sx={{ color: "grey.600", mb: 2 }}
                >
                  Unlock your potential. Learn, create, and grow with Progresso
                </Typography>
                <Box
                  component="form"
                  onSubmit={handleLogin}
                  sx={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                  }}
                >
                  <TextField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    fullWidth
                    size="small"
                    InputProps={{
                      sx: { borderRadius: 2, bgcolor: "grey.100" },
                    }}
                  />
                  <TextField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    fullWidth
                    size="small"
                    InputProps={{
                      sx: { borderRadius: 2, bgcolor: "grey.100" },
                    }}
                  />
                  <Box
                    sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: "primary.main", cursor: "pointer" }}
                    >
                      Forgot password?
                    </Typography>
                  </Box>
                  {error && (
                    <Typography
                      color="error"
                      variant="body2"
                      align="center"
                      sx={{ mb: 1 }}
                    >
                      {error}
                    </Typography>
                  )}
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{
                      borderRadius: 2,
                      fontWeight: 700,
                      fontSize: 16,
                      py: 1.2,
                      boxShadow: 1,
                      mb: 1,
                    }}
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : "Get Started"}
                  </Button>
                </Box>
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    my: 2,
                  }}
                >
                  <Box sx={{ flex: 1, height: 1, bgcolor: "grey.300" }} />
                  <Typography
                    variant="caption"
                    sx={{ mx: 1, color: "grey.500" }}
                  >
                    Or sign in with
                  </Typography>
                  <Box sx={{ flex: 1, height: 1, bgcolor: "grey.300" }} />
                </Box>
                <Stack
                  direction="row"
                  spacing={2}
                  justifyContent="center"
                  sx={{ mb: 1 }}
                >
                  <IconButton
                    color="primary"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    aria-label="Login with Google"
                    sx={{
                      bgcolor: "grey.100",
                      borderRadius: 2,
                      boxShadow: 1,
                      p: 1,
                    }}
                  >
                    <img
                      src={googleLogo}
                      alt="Google"
                      style={{ width: 24, height: 24 }}
                    />
                  </IconButton>
                  <IconButton
                    color="primary"
                    disabled
                    aria-label="Login with Facebook"
                    sx={{ bgcolor: "grey.100", borderRadius: 2, boxShadow: 1 }}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="#1877F3"
                    >
                      <path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.326 24h11.495v-9.294H9.691v-3.622h3.13V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.405 24 24 23.408 24 22.674V1.326C24 .592 23.405 0 22.675 0" />
                    </svg>
                  </IconButton>
                  <IconButton
                    color="primary"
                    disabled
                    aria-label="Login with Apple"
                    sx={{ bgcolor: "grey.100", borderRadius: 2, boxShadow: 1 }}
                  >
                    <AppleIcon fontSize="medium" />
                  </IconButton>
                </Stack>
              </Box>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showSuccess && !showWelcomeNewUser && (
          isExistingUser === false ? (
            <motion.div
              initial={{ y: -400, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -400, opacity: 0 }}
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
                  {googleUser && (
                    <>
                      {googleUser.photoURL ? (
                        <img
                          src={googleUser.photoURL}
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
                      <Typography variant="subtitle1">
                        {googleUser.displayName}
                      </Typography>
                      <Typography variant="body2">{googleUser.email}</Typography>
                    </>
                  )}
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    You have successfully logged in with Google.
                  </Typography>
                  <IconButton
                    color="primary"
                    onClick={() => setShowWelcomeNewUser(true)}
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
          ) : (
            <motion.div
              initial={{ y: -400, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -400, opacity: 0 }}
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
                    Welcome back!
                  </Typography>
                  {googleUser && (
                    <>
                      {googleUser.photoURL ? (
                        <img
                          src={googleUser.photoURL}
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
                      <Typography variant="subtitle1">
                        {googleUser.displayName}
                      </Typography>
                      <Typography variant="body2">{googleUser.email}</Typography>
                    </>
                  )}
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    You have successfully logged in with Google.
                  </Typography>
                  <IconButton
                    color="primary"
                    onClick={() => navigate('/home')}
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
          )
        )}
        {showWelcomeNewUser && (
          <WelcomeNewUser
            displayName={googleUser?.displayName}
            email={googleUser?.email}
            photoURL={googleUser?.photoURL}
            onNext={() => {
              // Handle next action, e.g., redirect to dashboard
              console.log("Next button clicked");
            }}
          />
        )}
      </AnimatePresence>
    </Box>
  );
};

export default LoginView;
