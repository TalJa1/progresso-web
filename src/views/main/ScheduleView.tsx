import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import HorizontalNavigationBar from "../../components/HorizontalNavigationBar";
import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Snackbar,
  Alert,
  Slide,
  InputAdornment,
  MenuItem,
} from "@mui/material";
// TransitionProps import removed - using a simple SlideTransition function
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DescriptionIcon from "@mui/icons-material/Description";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import EventIcon from "@mui/icons-material/Event";
import GroupsIcon from "@mui/icons-material/Groups";
import InfoIcon from "@mui/icons-material/Info";
import { ScheduleIcon } from "../../services/scheduleCreateIcon";
import { getUserByEmail } from "../../apis/users/usersAPI";
import {
  getSchedulesByUser,
  createSchedule,
} from "../../apis/schedules/scheduleApi";
import type { ScheduleModel } from "../../services/apiModel";

const SCHEDULE_TYPES = [
  "Homework",
  "Exam",
  "Group Meeting",
  "Event",
  "Learning",
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

const ScheduleView = () => {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun

  // Dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [infoDate, setInfoDate] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "",
    start_time: "",
    event_date: "",
  });

  // Animation direction for dialog
  const [dialogDirection, setDialogDirection] = useState<
    "left" | "right" | "top" | "bottom"
  >("left");
  useEffect(() => {
    if (infoOpen) {
      const directions = ["left", "right", "top", "bottom"];
      // Pick a random direction each time dialog opens
      setDialogDirection(
        directions[Math.floor(Math.random() * directions.length)] as
          | "left"
          | "right"
          | "top"
          | "bottom"
      );
    }
  }, [infoOpen]);
  const [eventsByDate, setEventsByDate] = useState<{
    [date: string]: ScheduleModel[];
  }>({});
  const [userId, setUserId] = useState<number | null>(null);
  const [scheduleCountByDate, setScheduleCountByDate] = useState<{
    [date: string]: number;
  }>({});
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const handleSnackbarClose = (
    _?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") return;
    setSnackbar((s) => ({ ...s, open: false }));
  };

  // Slide transition that makes the snackbar slide in from the right
  const SlideTransition = (props: React.ComponentProps<typeof Slide>) => {
    return <Slide {...props} direction="left" />;
  };

  useEffect(() => {
    const fetchUserId = async () => {
      const googleUser = localStorage.getItem("googleUser");
      if (googleUser) {
        try {
          const parsed = JSON.parse(googleUser);
          if (parsed.email) {
            const user = await getUserByEmail(parsed.email);
            setUserId(user.id);
          }
        } catch {
          console.log("Failed to parse user data");
        }
      }
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchSchedules = async () => {
      if (userId) {
        const data = await getSchedulesByUser(userId);
        const count: { [date: string]: number } = {};
        const events: { [date: string]: ScheduleModel[] } = {};
        data.forEach((item: ScheduleModel) => {
          if (item.event_date) {
            count[item.event_date] = (count[item.event_date] || 0) + 1;
            if (!events[item.event_date]) events[item.event_date] = [];
            events[item.event_date].push(item);
          }
        });
        setScheduleCountByDate(count);
        setEventsByDate(events);
      }
    };
    fetchSchedules();
  }, [userId]);

  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < calendarCells.length; i += 7) {
    weeks.push(calendarCells.slice(i, i + 7));
  }

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };
  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleDateClick = (day: number | null) => {
    if (!day) return;
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;
    setInfoDate(dateStr);
    setInfoOpen(true);
  };
  const handleCreateOpen = () => {
    setForm({
      title: "",
      description: "",
      type: "",
      start_time: "",
      event_date: "",
    });
    setCreateOpen(true);
  };
  const handleCreateClose = () => {
    setCreateOpen(false);
  };
  const handleInfoClose = () => {
    setInfoOpen(false);
    setInfoDate(null);
  };
  const handleCreateSubmit = async () => {
    if (!userId) {
      setSnackbar({
        open: true,
        message: "Failed to create schedule: user not found.",
        severity: "error",
      });
      return;
    }
    try {
      await createSchedule({
        user_id: userId,
        title: form.title,
        description: form.description,
        type: form.type,
        event_date: form.event_date,
        start_time: form.start_time,
      });
      handleCreateClose();
      const data = await getSchedulesByUser(userId);
      const count: { [date: string]: number } = {};
      const events: { [date: string]: ScheduleModel[] } = {};
      data.forEach((item: ScheduleModel) => {
        if (item.event_date) {
          count[item.event_date] = (count[item.event_date] || 0) + 1;
          if (!events[item.event_date]) events[item.event_date] = [];
          events[item.event_date].push(item);
        }
      });
      setScheduleCountByDate(count);
      setEventsByDate(events);
      setSnackbar({
        open: true,
        message: "Event added successfully.",
        severity: "success",
      });
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: "Failed to create schedule. Please try again later.",
        severity: "error",
      });
    }
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
        {/* Render here */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            pb: 2,
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton onClick={handlePrevMonth}>
              <ArrowBackIosNewIcon />
            </IconButton>
            <Typography variant="h5" fontWeight={700} sx={{ mx: 2 }}>
              {new Date(viewYear, viewMonth).toLocaleString("default", {
                month: "long",
              })}{" "}
              {viewYear}
            </Typography>
            <IconButton onClick={handleNextMonth}>
              <ArrowForwardIosIcon />
            </IconButton>
          </Box>
          <Button
            variant="contained"
            onClick={handleCreateOpen}
            sx={{
              fontWeight: 700,
              bgcolor: "#4f46e5",
              color: "#fff",
              borderRadius: 2,
              px: 3,
              py: 1,
              "&:hover": { bgcolor: "#4338ca" },
            }}
          >
            Add Event
          </Button>
        </Box>
        {/* Info Dialog for date events */}
        <Dialog
          open={infoOpen}
          onClose={handleInfoClose}
          PaperProps={{
            sx: { borderRadius: 4, minWidth: 680, p: 0, overflow: "visible" },
            component: motion.div,
            initial: (() => {
              switch (dialogDirection) {
                case "left":
                  return { x: -100, opacity: 0 };
                case "right":
                  return { x: 100, opacity: 0 };
                case "top":
                  return { y: -100, opacity: 0 };
                case "bottom":
                  return { y: 100, opacity: 0 };
                default:
                  return { opacity: 0 };
              }
            })(),
            animate: { x: 0, y: 0, opacity: 1 },
            transition: { type: "spring", stiffness: 200, damping: 40 },
          }}
        >
          <DialogTitle
            sx={{ fontWeight: 700, fontSize: 20, textAlign: "center", pt: 3 }}
          >
            Events on {infoDate}
          </DialogTitle>
          <DialogContent sx={{ pt: 1, pb: 3 }}>
            {infoDate &&
            eventsByDate[infoDate] &&
            eventsByDate[infoDate].length > 0 ? (
              eventsByDate[infoDate].map((event, idx) => {
                // Map event types to color styles (keeps parity with calendar icon colors)
                const typeStyles: {
                  [k: string]: {
                    color: string;
                    gradFrom: string;
                    gradTo: string;
                    lightBg: string;
                  };
                } = {
                  Homework: {
                    color: "#1976d2",
                    gradFrom: "#1976d2",
                    gradTo: "#1357a6",
                    lightBg: "rgba(25,118,210,0.06)",
                  },
                  Exam: {
                    color: "#ff9800",
                    gradFrom: "#ff9800",
                    gradTo: "#f57c00",
                    lightBg: "rgba(255,152,0,0.06)",
                  },
                  Meeting: {
                    color: "#43a047",
                    gradFrom: "#43a047",
                    gradTo: "#2e7d32",
                    lightBg: "rgba(67,160,71,0.06)",
                  },
                  "Group Meeting": {
                    color: "#43a047",
                    gradFrom: "#43a047",
                    gradTo: "#2e7d32",
                    lightBg: "rgba(67,160,71,0.06)",
                  },
                  Event: {
                    color: "#7c3aed",
                    gradFrom: "#7c3aed",
                    gradTo: "#5b21b6",
                    lightBg: "rgba(124,58,237,0.06)",
                  },
                  Learning: {
                    color: "#06b6d4",
                    gradFrom: "#06b6d4",
                    gradTo: "#0e7490",
                    lightBg: "rgba(6,182,212,0.06)",
                  },
                  default: {
                    color: "#90a4ae",
                    gradFrom: "#90a4ae",
                    gradTo: "#6b7280",
                    lightBg: "rgba(144,164,174,0.06)",
                  },
                };
                const styleForType =
                  typeStyles[event.type] || typeStyles.default;
                const typeColor = styleForType.color;
                const gradFrom = styleForType.gradFrom;
                const gradTo = styleForType.gradTo;
                const lightBg = styleForType.lightBg;
                // icon rendered white so it contrasts with the colored badge
                let icon = null;
                switch (event.type) {
                  case "Homework":
                    icon = (
                      <MenuBookIcon sx={{ fontSize: 20, color: "#fff" }} />
                    );
                    break;
                  case "Exam":
                    icon = <EventIcon sx={{ fontSize: 20, color: "#fff" }} />;
                    break;
                  case "Meeting":
                  case "Group Meeting":
                    icon = <GroupsIcon sx={{ fontSize: 20, color: "#fff" }} />;
                    break;
                  default:
                    icon = <InfoIcon sx={{ fontSize: 20, color: "#fff" }} />;
                }
                return (
                  <Box key={idx} sx={{ pb: 2 }}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        background: "#fff",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 2,
                        boxShadow: "0 6px 18px rgba(15,23,42,0.04)",
                        border: "1px solid rgba(15,23,42,0.04)",
                        borderLeft: `4px solid ${typeColor}`,
                        transition:
                          "transform 120ms ease, box-shadow 120ms ease",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: "0 12px 30px rgba(15,23,42,0.08)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: "50%",
                          background: `linear-gradient(90deg, ${gradFrom}, ${gradTo})`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          boxShadow: `0 6px 16px ${lightBg.replace(
                            "0.06",
                            "0.12"
                          )}`,
                        }}
                      >
                        {icon}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            pb: 1,
                          }}
                        >
                          <Typography
                            fontWeight={800}
                            fontSize={18}
                            color={typeColor}
                            sx={{ flex: 1 }}
                          >
                            {event.title}
                          </Typography>
                          <Box
                            sx={{
                              px: 1,
                              py: 0.5,
                              bgcolor: lightBg,
                              color: typeColor,
                              borderRadius: 1,
                              fontWeight: 700,
                              fontSize: 12,
                            }}
                          >
                            {event.type}
                          </Box>
                        </Box>

                        {/* Time box with icon */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            pb: 1,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              px: 1.25,
                              py: 0.5,
                              bgcolor: lightBg,
                              borderRadius: 1.5,
                              color: typeColor,
                              fontWeight: 700,
                              fontSize: 13,
                            }}
                          >
                            <AccessTimeIcon
                              sx={{ fontSize: 16, color: typeColor }}
                            />
                            <Box component="span">
                              {event.start_time || "—"}
                            </Box>
                          </Box>
                        </Box>

                        <Typography
                          variant="body2"
                          color="#444"
                          sx={{ lineHeight: 1.45 }}
                        >
                          {`status: ${event.description || "No description"}`}
                        </Typography>
                      </Box>
                    </Box>
                    {/* subtle divider between events */}
                    {idx < eventsByDate[infoDate].length - 1 && (
                      <Box
                        sx={{
                          height: 1,
                          bgcolor: "rgba(79,70,229,0.02)",
                          mt: 2,
                        }}
                      />
                    )}
                  </Box>
                );
              })
            ) : (
              <Typography color="text.secondary">
                No events for this date.
              </Typography>
            )}
          </DialogContent>
        </Dialog>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 0.3,
            width: "100%",
            border: "1px solid rgba(79,70,229,0.06)",
            borderRadius: 2,
            overflow: "hidden",
            background: "rgba(79,70,229,0.04)",
          }}
        >
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((w) => (
            <Typography
              key={w}
              align="center"
              fontWeight={600}
              color="#4f46e5"
              sx={{
                pb: 1,
                borderBottom: "1px solid rgba(79,70,229,0.04)",
                bgcolor: "rgba(79,70,229,0.02)",
                py: 1,
              }}
            >
              {w}
            </Typography>
          ))}
          {weeks.map((week, wi) =>
            week.map((day, di) => {
              const isToday =
                day &&
                viewYear === today.getFullYear() &&
                viewMonth === today.getMonth() &&
                day === today.getDate();
              const dateStr = day
                ? `${viewYear}-${String(viewMonth + 1).padStart(
                    2,
                    "0"
                  )}-${String(day).padStart(2, "0")}`
                : "";
              const iconCount = scheduleCountByDate[dateStr] || 0;
              return (
                <Box
                  key={wi + "-" + di}
                  sx={{
                    minHeight: 64,
                    bgcolor: isToday
                      ? "rgba(79,70,229,0.06)"
                      : day
                      ? "#fff"
                      : "#fafafa",
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "flex-start",
                    p: 1,
                    position: "relative",
                    boxShadow: isToday ? "0 6px 18px rgba(79,70,229,0.06)" : 0,
                    border: isToday
                      ? "1px solid rgba(79,70,229,0.12)"
                      : undefined,
                    cursor: day ? "pointer" : "default",
                  }}
                  onClick={() => handleDateClick(day)}
                >
                  <Typography
                    variant="body1"
                    fontWeight={isToday ? 700 : 500}
                    color={isToday ? "#4027cfff" : "#222"}
                  >
                    {day || ""}
                  </Typography>
                  {/* Render icons for schedules on this date */}
                  {iconCount > 0 && (
                    <Box
                      sx={{
                        position: "absolute",
                        right: 2,
                        bottom: 2,
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 0.5,
                        zIndex: 2,
                      }}
                    >
                      {iconCount <= 3 ? (
                        Array.from({ length: iconCount }).map((_, idx) => {
                          const icon = ScheduleIcon[idx % ScheduleIcon.length];
                          return (
                            <img
                              key={idx}
                              src={icon.url}
                              alt="schedule"
                              style={{
                                width: 14,
                                height: 14,
                                borderRadius: 3,
                                boxShadow: "0 4px 10px rgba(79,70,229,0.08)",
                              }}
                            />
                          );
                        })
                      ) : (
                        <>
                          <img
                            src={
                              ScheduleIcon[
                                (iconCount - 1) % ScheduleIcon.length
                              ].url
                            }
                            alt="schedule"
                            style={{
                              width: 14,
                              height: 14,
                              borderRadius: 3,
                              boxShadow: "0 4px 10px rgba(79,70,229,0.08)",
                            }}
                          />
                          <Box
                            sx={{
                              ml: 0.5,
                              px: 0.5,
                              minWidth: 16,
                              height: 16,
                              bgcolor: "rgba(79,70,229,0.06)",
                              borderRadius: 8,
                              fontSize: 11,
                              fontWeight: 700,
                              color: "#4f46e5",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: "0 4px 10px rgba(79,70,229,0.08)",
                            }}
                          >
                            {iconCount}
                          </Box>
                        </>
                      )}
                    </Box>
                  )}
                </Box>
              );
            })
          )}
        </Box>
        <Dialog
          open={createOpen}
          onClose={handleCreateClose}
          PaperProps={{
            sx: { borderRadius: 4, minWidth: 340, p: 0 },
            component: motion.div,
            initial: { y: 100, opacity: 0 },
            animate: { y: 0, opacity: 1 },
            transition: { type: "spring", stiffness: 200, damping: 40 },
          }}
        >
          <DialogTitle
            sx={{ fontWeight: 700, fontSize: 22, textAlign: "center", pt: 3 }}
          >
            CREATE NEW SCHEDULE
          </DialogTitle>
          <DialogContent sx={{ pt: 1, pb: 3 }}>
            <TextField
              label="Title"
              fullWidth
              required
              margin="normal"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarTodayIcon sx={{ color: "#4f46e5" }} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              minRows={2}
              margin="normal"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DescriptionIcon sx={{ color: "#4f46e5" }} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Type"
              fullWidth
              select
              margin="normal"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocalOfferIcon sx={{ color: "#4f46e5" }} />
                  </InputAdornment>
                ),
              }}
            >
              {SCHEDULE_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center", mt: 1 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <TimePicker
                  label="Start time"
                  value={
                    form.start_time
                      ? new Date(`2000-01-01T${form.start_time}`)
                      : null
                  }
                  onChange={(value) => {
                    if (value) {
                      const hours = String(value.getHours()).padStart(2, "0");
                      const minutes = String(value.getMinutes()).padStart(
                        2,
                        "0"
                      );
                      setForm({ ...form, start_time: `${hours}:${minutes}` });
                    }
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: "normal",
                      InputProps: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <AccessTimeIcon sx={{ color: "#4f46e5" }} />
                          </InputAdornment>
                        ),
                      },
                      sx: { flex: 1 },
                    },
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <DatePicker
                    label="Date"
                    value={form.event_date ? new Date(form.event_date) : null}
                    onChange={(date: Date | null) => {
                      if (date && !isNaN(date.getTime())) {
                        const yyyy = date.getFullYear();
                        const mm = String(date.getMonth() + 1).padStart(2, "0");
                        const dd = String(date.getDate()).padStart(2, "0");
                        setForm({ ...form, event_date: `${yyyy}-${mm}-${dd}` });
                      } else {
                        setForm({ ...form, event_date: "" });
                      }
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        margin: "normal",
                        InputProps: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <AccessTimeIcon sx={{ color: "#4f46e5" }} />
                            </InputAdornment>
                          ),
                        },
                        sx: { flex: 1 },
                      },
                    }}
                  />
                </Box>
              </LocalizationProvider>
            </Box>
            <Box mt={3} display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                sx={{
                  minWidth: 100,
                  fontWeight: 700,
                  bgcolor: "#4f46e5",
                  "&:hover": { bgcolor: "#4338ca" },
                }}
                onClick={handleCreateSubmit}
                disabled={
                  !form.title ||
                  !form.description ||
                  !form.type ||
                  !form.start_time ||
                  !form.event_date
                }
              >
                Create
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        TransitionComponent={SlideTransition}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ScheduleView;
