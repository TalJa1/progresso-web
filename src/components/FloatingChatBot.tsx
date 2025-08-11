import { useState } from "react";
import { chatWithGemini } from "../apis/aichatApi";
import {
  Box,
  IconButton,
  Button,
  TextField,
  Typography,
  Paper,
  Avatar,
  CircularProgress,
} from "@mui/material";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToy";

const FloatingChatBot = () => {
  const [open, setOpen] = useState(false);
  const googleUser = JSON.parse(localStorage.getItem("googleUser") || "{}");
  const userName = googleUser?.displayName || "there";
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: `Hey ${userName} 👋\n\nI just spawned into existence, and you’re one of the first humans I get to chat with! I’m here to help, but if I blunder, think of it as my AI growing pains—let’s improve together!\n\nWhat can I assist you with? For e.g. you may ask`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages([...messages, { sender: "user", text: input }]);
    setLoading(true);
    try {
      const res = await chatWithGemini(input);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: res.reply || "No response." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Sorry, something went wrong." },
      ]);
    }
    setInput("");
    setLoading(false);
  };

  return (
    <Box sx={{ position: "fixed", bottom: 42, right: 42, zIndex: 9999 }}>
      {!open && (
        <IconButton
          color="primary"
          sx={{
            bgcolor: "#e1333b",
            color: "#fff",
            width: 60,
            height: 60,
            boxShadow: 3,
            "&:hover": { bgcolor: "#7b1217ff" },
          }}
          onClick={() => setOpen(true)}
          aria-label="Open ChatBot"
        >
          <ChatBubbleIcon sx={{ fontSize: 32 }} />
        </IconButton>
      )}
      {open && (
        <Paper
          elevation={8}
          sx={{
            position: "fixed",
            bottom: 100,
            right: 32,
            width: 500,
            borderRadius: 4,
            p: 0,
            zIndex: 10000,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              bgcolor: "#e1333b",
              color: "#fff",
              p: 2,
              fontWeight: 700,
              fontSize: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box display="flex" alignItems="center">
              <SmartToyIcon sx={{ mr: 1 }} />
              <span>
                Progresso pAI-ask{" "}
                <Typography
                  component="span"
                  sx={{
                    fontSize: 12,
                    bgcolor: "#fff",
                    color: "primary.main",
                    borderRadius: 1,
                    px: 1,
                    ml: 1,
                  }}
                >
                  Beta
                </Typography>
              </span>
            </Box>
            <IconButton
              onClick={() => setOpen(false)}
              sx={{ color: "#fff" }}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Box>
          {/* Chat Window */}
          <Box
            sx={{
              p: 2,
              bgcolor: "#f7f7f7",
              minHeight: 220,
              maxHeight: 320,
              overflowY: "auto",
            }}
          >
            {messages.map((msg, idx) => (
              <Box
                key={idx}
                sx={{
                  mb: 2,
                  textAlign: msg.sender === "bot" ? "left" : "right",
                }}
              >
                {msg.sender === "bot" ? (
                  <Box display="flex" alignItems="flex-start">
                    <Avatar
                      sx={{
                        bgcolor: "#e1333b",
                        width: 32,
                        height: 32,
                        mr: 1,
                      }}
                    >
                      <SmartToyIcon />
                    </Avatar>
                    <Paper
                      sx={{
                        bgcolor: "#fff",
                        borderRadius: 2,
                        p: 1.5,
                        maxWidth: 220,
                        fontSize: 15,
                        color: "#333",
                        boxShadow: 1,
                      }}
                    >
                      {msg.text}
                    </Paper>
                  </Box>
                ) : (
                  <Box display="inline-block">
                    <Paper
                      sx={{
                        bgcolor: "#e3f2fd",
                        borderRadius: 2,
                        p: 1.5,
                        maxWidth: 220,
                        fontSize: 15,
                        color: "primary.main",
                        boxShadow: 1,
                      }}
                    >
                      {msg.text}
                    </Paper>
                  </Box>
                )}
              </Box>
            ))}
            {/* Quick buttons */}
            {messages.length === 1 && (
              <Box mt={2} display="flex" flexDirection="column" gap={1}>
                {[
                  "I have a doubt",
                  "Can you help me with something?"
                ].map((preset) => (
                  <Button
                    key={preset}
                    variant="outlined"
                    color="primary"
                    sx={{
                      borderRadius: 3,
                      textTransform: "none",
                      fontWeight: 500,
                      fontSize: 15,
                      mb: 0.5,
                    }}
                    onClick={() => setInput(preset)}
                  >
                    {preset}
                  </Button>
                ))}
              </Box>
            )}
          </Box>
          {/* Input */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              borderTop: "1px solid #eee",
              bgcolor: "#fff",
              p: 1.5,
            }}
          >
            <TextField
              fullWidth
              variant="standard"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              placeholder="Ask me..."
              InputProps={{ disableUnderline: true }}
              sx={{ fontSize: 15, bgcolor: "#fff" }}
              disabled={loading}
            />
            <IconButton
              onClick={handleSend}
              disabled={loading || !input.trim()}
              color="primary"
              sx={{
                ml: 1,
                bgcolor: "primary.main",
                color: "#fff",
                borderRadius: 2,
                "&:hover": { bgcolor: "primary.dark" },
              }}
            >
              {loading ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                <SendIcon />
              )}
            </IconButton>
          </Box>
          {/* Footer */}
          <Box
            sx={{
              bgcolor: "#f7f7f7",
              color: "#888",
              fontSize: 12,
              textAlign: "center",
              p: 1,
            }}
          >
            pAI-ask (Beta) is powered by AI. It is not reflective of expert
            advice, so check for mistakes. Kindly review{" "}
            <a
              href="https://www.upgrad.com/privacy-policy/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#1976d2" }}
            >
              Progresso Privacy Policy
            </a>
            .
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default FloatingChatBot;
