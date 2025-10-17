import { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Avatar,
  CircularProgress,
  IconButton,
} from "@mui/material";
import QuizIcon from "@mui/icons-material/Quiz";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AddIcon from "@mui/icons-material/Add";
import HorizontalNavigationBar from "../../components/HorizontalNavigationBar";
import { getAllLessons, createBulkLessons } from "../../apis/lessons/lessonAPI";
import { getAllTopics } from "../../apis/topics/topicAPI";
import type {
  LessonModel,
  TopicModel,
  UserModel,
} from "../../services/apiModel";
import type { BulkLessonCreate } from "../../apis/lessons/lessonAPI";
import { useNavigate } from "react-router-dom";
import { mocktestData } from "../../services/mocktest";
import {
  createLessonCompleted,
  getLessonsCompletedByUser,
} from "../../apis/lessons/lessonCompletedAPI";
import { getUserByEmail } from "../../apis/users/usersAPI";
import FloatingChatBot from "../../components/FloatingChatBot";
import BulkLessonModal from "../../components/home/BulkLessonModal";

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
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [mockPage, setMockPage] = useState(0);
  const [mockItemsPerPage, setMockItemsPerPage] = useState(3);
  // Animation states
  const [isLessonsAnimating, setIsLessonsAnimating] = useState(false);
  const [lessonsAnimationDirection, setLessonsAnimationDirection] = useState<
    "left" | "right"
  >("left");
  const [isMockAnimating, setIsMockAnimating] = useState(false);
  const [mockAnimationDirection, setMockAnimationDirection] = useState<
    "left" | "right"
  >("left");
  // Refs for measuring available width
  const lessonsContainerRef = useRef<HTMLDivElement | null>(null);
  const mockContainerRef = useRef<HTMLDivElement | null>(null);
  const [user, setUser] = useState<{
    displayName: "";
    email: "";
    photoURL: "";
    uid: "";
  } | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [loadingQuizletId, setLoadingQuizletId] = useState<number | null>(null);
  const navigateTimeoutRef = useRef<number | null>(null);
  
  // Admin bulk lesson states
  const [isAdmin, setIsAdmin] = useState(false);
  const [openBulkModal, setOpenBulkModal] = useState(false);
  const [bulkLessons, setBulkLessons] = useState<BulkLessonCreate[]>([
    {
      topic_id: 1,
      title: "",
      content: "",
      video_url: null,
      short_describe: "",
    },
  ]);
  const [isSubmittingBulk, setIsSubmittingBulk] = useState(false);

  // Card sizing assumptions (kept small and adjustable)
  const LESSON_CARD_MIN_WIDTH = 320; // px
  const MOCK_CARD_MIN_WIDTH = 320; // px
  const GAP_PX = 24; // matches `gap: 3` (3 * 8px theme spacing)

  const computeItemsPerPage = (
    containerWidth: number,
    cardMinWidth: number,
    gap: number
  ) => {
    if (!containerWidth || containerWidth <= cardMinWidth) return 1;
    // formula: floor((containerWidth + gap) / (cardMinWidth + gap))
    return Math.max(
      1,
      Math.floor((containerWidth + gap) / (cardMinWidth + gap))
    );
  };

  // Animation handlers for lessons
  const handleLessonsNavigation = (direction: "next" | "prev") => {
    if (isLessonsAnimating) return;

    const newDirection = direction === "next" ? "left" : "right";
    setLessonsAnimationDirection(newDirection);
    setIsLessonsAnimating(true);

    setTimeout(() => {
      if (direction === "next") {
        setPage(page + 1);
      } else {
        setPage(Math.max(0, page - 1));
      }

      setTimeout(() => {
        setIsLessonsAnimating(false);
      }, 400); // Match animation duration
    }, 200); // Half animation for smooth transition
  };

  // Animation handlers for mock tests
  const handleMockNavigation = (direction: "next" | "prev") => {
    if (isMockAnimating) return;

    const newDirection = direction === "next" ? "left" : "right";
    setMockAnimationDirection(newDirection);
    setIsMockAnimating(true);

    setTimeout(() => {
      if (direction === "next") {
        setMockPage(mockPage + 1);
      } else {
        setMockPage(Math.max(0, mockPage - 1));
      }

      setTimeout(() => {
        setIsMockAnimating(false);
      }, 400); // Match animation duration
    }, 200); // Half animation for smooth transition
  };

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
        
        // Check if user is admin
        const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
        if (parsed.email === adminEmail) {
          setIsAdmin(true);
        }
        
        (async () => {
          try {
            const dbUser: UserModel = await getUserByEmail(parsed.email);
            setUserId(dbUser.id);
          } catch {
            setUserId(null);
          }
        })();
      } catch {
        setUser(null);
        setUserId(null);
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
        if (userId) {
          try {
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
  }, [userId]);

  // Update itemsPerPage for lessons and mock tests when containers resize
  useEffect(() => {
    const lessonEl = lessonsContainerRef.current;
    const mockEl = mockContainerRef.current;

    const resizeLesson = () => {
      if (lessonEl) {
        const w = lessonEl.clientWidth;
        const n = computeItemsPerPage(w, LESSON_CARD_MIN_WIDTH, GAP_PX);
        setItemsPerPage(n);
        // ensure page is within bounds
        setPage((p) =>
          Math.min(
            p,
            Math.max(0, Math.ceil(allLessons.length / Math.max(1, n)) - 1)
          )
        );
      }
    };

    const resizeMock = () => {
      if (mockEl) {
        const w = mockEl.clientWidth;
        const n = computeItemsPerPage(w, MOCK_CARD_MIN_WIDTH, GAP_PX);
        setMockItemsPerPage(n);
        setMockPage((p) =>
          Math.min(
            p,
            Math.max(0, Math.ceil(mocktestData.length / Math.max(1, n)) - 1)
          )
        );
      }
    };

    // Initial measure
    resizeLesson();
    resizeMock();

    // Use ResizeObserver if available for smoother updates
    let roLesson: ResizeObserver | null = null;
    let roMock: ResizeObserver | null = null;
    // Use ResizeObserver if available
    const RObserver = (
      window as unknown as { ResizeObserver?: typeof ResizeObserver }
    ).ResizeObserver;
    if (RObserver) {
      if (lessonEl) {
        roLesson = new RObserver(resizeLesson);
        if (roLesson) roLesson.observe(lessonEl);
      }
      if (mockEl) {
        roMock = new RObserver(resizeMock);
        if (roMock) roMock.observe(mockEl);
      }
    }

    // fallback: window resize
    window.addEventListener("resize", resizeLesson);
    window.addEventListener("resize", resizeMock);

    return () => {
      window.removeEventListener("resize", resizeLesson);
      window.removeEventListener("resize", resizeMock);
      if (roLesson && lessonEl) roLesson.unobserve(lessonEl);
      if (roMock && mockEl) roMock.unobserve(mockEl);
    };
  }, [allLessons.length]);

  useEffect(() => {
    return () => {
      if (navigateTimeoutRef.current) {
        window.clearTimeout(navigateTimeoutRef.current);
      }
    };
  }, []);

  // Admin bulk lesson handlers
  const handleOpenBulkModal = () => {
    setOpenBulkModal(true);
  };

  const handleCloseBulkModal = () => {
    setOpenBulkModal(false);
    setBulkLessons([
      {
        topic_id: 1,
        title: "",
        content: "",
        video_url: null,
        short_describe: "",
      },
    ]);
  };

  const handleSubmitBulkLessons = async () => {
    try {
      setIsSubmittingBulk(true);
      await createBulkLessons(bulkLessons);
      alert("Lessons added successfully!");
      handleCloseBulkModal();
      // Refresh lessons
      const lessonsData = await getAllLessons();
      setAllLessons(lessonsData);
    } catch (error) {
      console.error("Error adding bulk lessons:", error);
      alert("Error adding lessons. Please try again.");
    } finally {
      setIsSubmittingBulk(false);
    }
  };

  return (
    <Box
      sx={{
        bgcolor: "#fafafa",
        minHeight: "100%",
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
          {isAdmin && (
            <Button
              variant="contained"
              color="success"
              startIcon={<AddIcon />}
              onClick={handleOpenBulkModal}
              sx={{
                mr: 2,
                borderRadius: 2,
                fontWeight: 700,
                textTransform: "none",
              }}
            >
              Add Lessons
            </Button>
          )}
          <IconButton
            onClick={() => handleLessonsNavigation("prev")}
            disabled={page === 0 || loading || isLessonsAnimating}
            sx={{ ml: 1 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <IconButton
            onClick={() => handleLessonsNavigation("next")}
            disabled={
              loading ||
              isLessonsAnimating ||
              (page + 1) * itemsPerPage >= allLessons.length
            }
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
          ref={lessonsContainerRef}
          className={
            isLessonsAnimating
              ? lessonsAnimationDirection === "left"
                ? "slide-enter-left"
                : "slide-enter-right"
              : ""
          }
        >
          {loading ? (
            <CircularProgress />
          ) : allLessons.length === 0 ? (
            <Typography>No lessons found.</Typography>
          ) : (
            allLessons
              .slice(page * itemsPerPage, page * itemsPerPage + itemsPerPage)
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
                    {completedLessons.includes(lesson.id) ? (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                          gap: 1,
                        }}
                      >
                        <Button
                          variant="contained"
                          color="success"
                          sx={{
                            borderRadius: 2,
                            fontWeight: 700,
                            fontSize: 14,
                            py: 0.7,
                            px: 2,
                            minWidth: 0,
                            boxShadow: 1,
                            flex: 1,
                            transition: "all 0.2s",
                          }}
                          onClick={() => navigate(`/learning/${lesson.id}`)}
                        >
                          Learn Again
                        </Button>
                        <IconButton
                          color="primary"
                          sx={{
                            ml: 0.5,
                            bgcolor: "#e3f2fd",
                            "&:hover": { bgcolor: "#bbdefb" },
                          }}
                          onClick={() => {
                            setLoadingQuizletId(lesson.id);
                            if (navigateTimeoutRef.current) {
                              window.clearTimeout(navigateTimeoutRef.current);
                            }
                            navigateTimeoutRef.current = window.setTimeout(
                              () => {
                                setLoadingQuizletId(null);
                                navigate(`/quizlet/${lesson.id}`);
                              },
                              2500
                            );
                          }}
                        >
                          {loadingQuizletId === lesson.id ? (
                            <CircularProgress size={20} />
                          ) : (
                            <QuizIcon />
                          )}
                        </IconButton>
                      </Box>
                    ) : (
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{
                          borderRadius: 2,
                          fontWeight: 700,
                          fontSize: 14,
                          py: 0.7,
                          px: 2,
                          minWidth: 0,
                          boxShadow: 1,
                          transition: "all 0.2s",
                        }}
                        onClick={async () => {
                          if (!completedLessons.includes(lesson.id)) {
                            try {
                              if (userId) {
                                await createLessonCompleted({
                                  user_id: userId,
                                  lesson_id: lesson.id,
                                  completed_at: new Date().toISOString(),
                                });
                              }
                            } catch {
                              console.log("Error marking lesson as completed");
                            }
                          }
                          navigate(`/learning/${lesson.id}`);
                        }}
                      >
                        Learn
                      </Button>
                    )}

                    <style>{`
        @keyframes moveUpCenter {
          0% { transform: translateY(100%); opacity: 0; }
          100% { transform: translateY(0%); opacity: 1; }
        }
        
        @keyframes slideInLeft {
          0% { transform: translateX(-100%); opacity: 0; }
          100% { transform: translateX(0%); opacity: 1; }
        }
        
        @keyframes slideInRight {
          0% { transform: translateX(100%); opacity: 0; }
          100% { transform: translateX(0%); opacity: 1; }
        }
        
        @keyframes slideOutLeft {
          0% { transform: translateX(0%); opacity: 1; }
          100% { transform: translateX(-100%); opacity: 0; }
        }
        
        @keyframes slideOutRight {
          0% { transform: translateX(0%); opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
        
        .slide-enter-left {
          animation: slideInRight 0.4s ease-out forwards;
        }
        
        .slide-enter-right {
          animation: slideInLeft 0.4s ease-out forwards;
        }
        
        .slide-exit-left {
          animation: slideOutLeft 0.4s ease-out forwards;
        }
        
        .slide-exit-right {
          animation: slideOutRight 0.4s ease-out forwards;
        }
      `}</style>
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
                onClick={() => handleMockNavigation("prev")}
                disabled={mockPage === 0 || isMockAnimating}
                sx={{ ml: 1 }}
              >
                <ArrowBackIcon />
              </IconButton>
              <IconButton
                onClick={() => handleMockNavigation("next")}
                disabled={
                  isMockAnimating ||
                  (mockPage + 1) * mockItemsPerPage >= mocktestData.length
                }
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
            ref={mockContainerRef}
            className={
              isMockAnimating
                ? mockAnimationDirection === "left"
                  ? "slide-enter-left"
                  : "slide-enter-right"
                : ""
            }
          >
            {mocktestData
              .slice(
                mockPage * mockItemsPerPage,
                mockPage * mockItemsPerPage + mockItemsPerPage
              )
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

      {/* Admin Bulk Lesson Modal */}
      <BulkLessonModal
        open={openBulkModal}
        onClose={handleCloseBulkModal}
        bulkLessons={bulkLessons}
        setBulkLessons={setBulkLessons}
        onSubmit={handleSubmitBulkLessons}
        isSubmitting={isSubmittingBulk}
      />

      {/* Ensure FloatingChatBot is rendered outside main content for visibility */}
      <FloatingChatBot />
    </Box>
  );
};

export default HomeView;
