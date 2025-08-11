import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Avatar,
  CircularProgress,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import HorizontalNavigationBar from "../../components/HorizontalNavigationBar";
import { getAllLessons } from "../../apis/lessons/lessonAPI";
import { getAllTopics } from "../../apis/topics/topicAPI";
import type { LessonModel, TopicModel } from "../../services/apiModel";
import { useNavigate } from "react-router-dom";
import { mocktestData } from "../../services/mocktest";

const HomeView = () => {
  const navigate = useNavigate();
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [topics, setTopics] = useState<TopicModel[]>([]);
  const today = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const getDateStr = (offset: number) => {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    return `${months[d.getMonth()]} ${pad(d.getDate())}, ${d.getFullYear()}`;
  };
  const [allLessons, setAllLessons] = useState<LessonModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const limit = 3;
  const [mockPage, setMockPage] = useState(0);
  const mockLimit = 3;
  const [user, setUser] = useState<{
    displayName: "";
    email: "";
    photoURL: "";
    uid: "";
  } | null>(null);

  useEffect(() => {
    const googleUser = localStorage.getItem("googleUser");
    if (googleUser) {
      try {
        const parsed = JSON.parse(googleUser);
        setUser({
          displayName: parsed.displayName || "",
          email: parsed.email || "",
          photoURL: parsed.photoURL || "",
          uid: parsed.uid || "",
        });
      } catch {
        setUser(null);
      }
    }
    const fetchLessonsAndTopics = async () => {
      setLoading(true);
      try {
        const [lessonsData, topicsData] = await Promise.all([
          getAllLessons(),
          getAllTopics(),
        ]);
        setAllLessons(lessonsData);
        setTopics(topicsData);
        let userId = null;
        const googleUser = localStorage.getItem("googleUser");
        if (googleUser) {
          try {
            const parsed = JSON.parse(googleUser);
            userId = parsed.id || parsed.uid;
          } catch {
            console.log("Error parsing Google user");
          }
        }
        if (userId) {
          try {
            const { getLessonsCompletedByUser } = await import(
              "../../apis/lessons/lessonCompletedAPI"
            );
            const completed = await getLessonsCompletedByUser(userId);
            type CompletedLesson = { lesson_id: number };
            setCompletedLessons(
              completed.map((c: CompletedLesson) => c.lesson_id)
            );
          } catch {
            setCompletedLessons([]);
          }
        }
      } catch {
        setAllLessons([]);
        setTopics([]);
        setCompletedLessons([]);
      }
      setLoading(false);
    };
    fetchLessonsAndTopics();
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
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Hi{" "}
            <span style={{ fontWeight: 900 }}>
              {user?.displayName || "User"}
            </span>{" "}
            <span role="img" aria-label="wave">
              👋
            </span>
          </Typography>
        </Box>
        <Typography
          variant="body1"
          sx={{ color: "grey.600", mb: 3, textAlign: "center" }}
        >
          Let's start your learning journey
        </Typography>
        <Box
          sx={{ display: "flex", alignItems: "center", width: "100%", mb: 2 }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, textAlign: "left", flex: 1 }}
          >
            My Lessons
          </Typography>
          <IconButton
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0 || loading}
            sx={{ ml: 1 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <IconButton
            onClick={() => setPage(page + 1)}
            disabled={loading || (page + 1) * limit >= allLessons.length}
            sx={{ ml: 1 }}
          >
            <ArrowForwardIcon />
          </IconButton>
        </Box>
        <Box
          sx={{
            display: "flex",
            gap: 3,
            flexWrap: "wrap",
            justifyContent: "flex-start",
            width: "100%",
          }}
        >
          {loading ? (
            <CircularProgress />
          ) : allLessons.length === 0 ? (
            <Typography>No lessons found.</Typography>
          ) : (
            allLessons
              .slice(page * limit, page * limit + limit)
              .map((lesson) => (
                <Paper
                  key={lesson.id}
                  elevation={3}
                  sx={{
                    p: 2,
                    maxWidth: 320,
                    width: "100%",
                    borderRadius: 4,
                    boxShadow: 3,
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "space-between",
                      height: "100%",
                      gap: 1,
                    }}
                  >
                    <Avatar
                      variant="rounded"
                      sx={{
                        width: "100%",
                        height: 100,
                        mb: 2,
                        bgcolor: "#e53935",
                        fontSize: 32,
                      }}
                    >
                      {lesson.title[0]}
                    </Avatar>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 700, textAlign: "center", mb: 1 }}
                    >
                      {lesson.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "grey.700", textAlign: "center", mb: 1 }}
                    >
                      {lesson.short_describe.length > 0 &&
                        lesson.short_describe}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 1,
                      }}
                    >
                      <Typography variant="caption" sx={{ color: "grey.600" }}>
                        {(() => {
                          const topic = topics.find(
                            (t) => t.id === lesson.topic_id
                          );
                          return topic ? (
                            <span style={{ fontWeight: 700, color: "black" }}>
                              Topic Category: {topic.name}
                            </span>
                          ) : (
                            `Topic ID: ${lesson.topic_id}`
                          );
                        })()}
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      color={
                        completedLessons.includes(lesson.id)
                          ? "success"
                          : "primary"
                      }
                      fullWidth
                      sx={{
                        borderRadius: 2,
                        fontWeight: 700,
                        fontSize: 16,
                        py: 1.2,
                        boxShadow: 1,
                      }}
                      onClick={() => navigate(`/learning/${lesson.id}`)}
                    >
                      {completedLessons.includes(lesson.id)
                        ? "Learn Again"
                        : "Learn"}
                    </Button>
                  </Box>
                </Paper>
              ))
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            mt: 5,
            mb: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Upcoming Events
          </Typography>
          <Button
            disabled
            variant="text"
            sx={{
              fontWeight: 700,
              color: "primary.main",
              fontSize: 16,
              textTransform: "none",
              px: 2,
            }}
            endIcon={<span style={{ fontSize: 20 }}>➔</span>}
          >
            View All
          </Button>
        </Box>
        <Box
          sx={{
            display: "flex",
            gap: 3,
            flexWrap: "wrap",
            alignItems: "stretch",
            width: "100%",
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 4,
              boxShadow: "0 4px 24px 0 rgba(0,0,0,0.08)",
              background: "linear-gradient(135deg, #eaffea 80%, #f6fff6 100%)",
              minWidth: 320,
              maxWidth: 340,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: "grey.700", mb: 1, display: "block" }}
            >
              Daily Doubt Resolution
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              DDRV 1 - {getDateStr(1)}
            </Typography>
            <Typography variant="body2" sx={{ color: "grey.800", mb: 1 }}>
              Progresso community
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Typography
                variant="body2"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <span role="img" aria-label="calendar">
                  🗓️
                </span>{" "}
                {getDateStr(1)}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "error.main", fontWeight: 700 }}
              >
                •
              </Typography>
              <Typography variant="body2">10:45 PM - 11:30 PM</Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <Button
              variant="contained"
              disabled
              fullWidth
              sx={{
                bgcolor: "grey.300",
                color: "grey.600",
                fontWeight: 700,
                borderRadius: 2,
                fontSize: 16,
                py: 1.2,
                boxShadow: 0,
                alignSelf: "flex-end",
              }}
            >
              Join Now
            </Button>
          </Paper>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 4,
              boxShadow: "0 4px 24px 0 rgba(0,0,0,0.08)",
              background: "linear-gradient(135deg, #eaffea 80%, #f6fff6 100%)",
              minWidth: 320,
              maxWidth: 340,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: "grey.700", mb: 1, display: "block" }}
            >
              Daily Doubt Resolution
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              DDR 1 - {getDateStr(2)}
            </Typography>
            <Typography variant="body2" sx={{ color: "grey.800", mb: 1 }}>
              Progresso community
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Typography
                variant="body2"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <span role="img" aria-label="calendar">
                  🗓️
                </span>{" "}
                {getDateStr(2)}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "error.main", fontWeight: 700 }}
              >
                •
              </Typography>
              <Typography variant="body2">04:00 PM - 05:00 PM</Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <Button
              variant="contained"
              disabled
              fullWidth
              sx={{
                bgcolor: "grey.300",
                color: "grey.600",
                fontWeight: 700,
                borderRadius: 2,
                fontSize: 16,
                py: 1.2,
                boxShadow: 0,
                alignSelf: "flex-end",
              }}
            >
              Join Now
            </Button>
          </Paper>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 4,
              boxShadow: "0 4px 24px 0 rgba(0,0,0,0.08)",
              background: "linear-gradient(135deg, #e6eaff 80%, #f6f6ff 100%)",
              minWidth: 320,
              maxWidth: 340,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
            }}
          >
            <Box sx={{ mb: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  bgcolor: "#e6eaff",
                  color: "primary.main",
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  fontWeight: 700,
                  display: "inline-block",
                }}
              >
                Lecture
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Fundamental of Math in logic
            </Typography>
            <Typography variant="body2" sx={{ color: "grey.800", mb: 1 }}>
              Progresso community
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Typography
                variant="body2"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <span role="img" aria-label="calendar">
                  🗓️
                </span>{" "}
                {getDateStr(3)}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "error.main", fontWeight: 700 }}
              >
                •
              </Typography>
              <Typography variant="body2">10:30 AM - 12:30 PM</Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <Button
              variant="contained"
              disabled
              fullWidth
              sx={{
                bgcolor: "grey.300",
                color: "grey.600",
                fontWeight: 700,
                borderRadius: 2,
                fontSize: 16,
                py: 1.2,
                boxShadow: 0,
                alignSelf: "flex-end",
              }}
            >
              Join Now
            </Button>
          </Paper>
        </Box>

        <Box sx={{ width: "100%", mt: 6, mb: 4 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Mock Tests
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <IconButton
                onClick={() => setMockPage(Math.max(0, mockPage - 1))}
                disabled={mockPage === 0}
                sx={{ ml: 1 }}
              >
                <ArrowBackIcon />
              </IconButton>
              <IconButton
                onClick={() => setMockPage(mockPage + 1)}
                disabled={(mockPage + 1) * mockLimit >= mocktestData.length}
                sx={{ ml: 1 }}
              >
                <ArrowForwardIcon />
              </IconButton>
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              gap: 3,
              flexWrap: "wrap",
              justifyContent: "flex-start",
              width: "100%",
            }}
          >
            {mocktestData
              .slice(mockPage * mockLimit, mockPage * mockLimit + mockLimit)
              .map((mock) => (
                <Paper
                  key={mock.url}
                  elevation={3}
                  sx={{
                    p: 2,
                    maxWidth: 320,
                    width: "100%",
                    borderRadius: 4,
                    boxShadow: 3,
                    mb: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    justifyContent: "flex-start",
                    background: "#fff",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      mb: 1,
                    }}
                  >
                    <Box
                      sx={{
                        bgcolor: "#1976d2",
                        color: "#fff",
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 2,
                        fontWeight: 700,
                        fontSize: 13,
                        mr: 1,
                      }}
                    >
                      {mock.title}
                    </Box>
                    <Box
                      sx={{
                        bgcolor: "#eaffea",
                        color: "#388e3c",
                        px: 1,
                        py: 0.5,
                        borderRadius: 2,
                        fontWeight: 700,
                        fontSize: 13,
                      }}
                    >
                      Free
                    </Box>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {mock.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "grey.700", mb: 1 }}>
                    {mock.describe}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Box
                      sx={{
                        bgcolor: "#e3f2fd",
                        color: "#1976d2",
                        px: 1,
                        py: 0.5,
                        borderRadius: 2,
                        fontWeight: 700,
                        fontSize: 12,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      Grade 9 → 10
                    </Box>
                    <Box
                      sx={{
                        bgcolor: "#eaffea",
                        color: "#388e3c",
                        px: 1,
                        py: 0.5,
                        borderRadius: 2,
                        fontWeight: 700,
                        fontSize: 12,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      Duration 90 min
                    </Box>
                    <Box
                      sx={{
                        bgcolor: "#fff8e1",
                        color: "#fbc02d",
                        px: 1,
                        py: 0.5,
                        borderRadius: 2,
                        fontWeight: 700,
                        fontSize: 12,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      Medium
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      href={mock.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ borderRadius: 2, fontWeight: 700 }}
                    >
                      OPEN PDF
                    </Button>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                      width: "100%",
                    }}
                  >
                    {/* <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        border: "2px solid #e0e0e0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mr: 1,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ color: "#bdbdbd", fontWeight: 700 }}
                      >
                        0%
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: "#757575" }}>
                      done
                    </Typography> */}
                  </Box>
                  <Box
                    sx={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Typography variant="caption" sx={{ color: "#bdbdbd" }}>
                      Last updated
                      <br />
                      Aug 2025
                    </Typography>
                  </Box>
                </Paper>
              ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default HomeView;
