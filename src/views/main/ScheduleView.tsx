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
          mt: 4,
          mb: 4,
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
            mb: 2,
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
            color="primary"
            onClick={handleCreateOpen}
            sx={{ fontWeight: 700 }}
          >
            Add Event
          </Button>
        </Box>
        {/* Info Dialog for date events */}
        <Dialog
          open={infoOpen}
          onClose={handleInfoClose}
          PaperProps={{
            sx: { borderRadius: 4, minWidth: 340, p: 0, overflow: "visible" },
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
                // Icon and color mapping per event type
                let icon = null;
                let cardColor = "#f5f7ff";
                let titleColor = "#222";
                switch (event.type) {
                  case "Homework":
                    icon = (
                      <MenuBookIcon sx={{ fontSize: 32, color: "#1976d2" }} />
                    );
                    cardColor = "#f5f7ff";
                    titleColor = "#1976d2";
                    break;
                  case "Exam":
                    icon = (
                      <EventIcon sx={{ fontSize: 32, color: "#ff9800" }} />
                    );
                    cardColor = "#fff7ed";
                    titleColor = "#ff9800";
                    break;
                  case "Meeting":
                    icon = (
                      <GroupsIcon sx={{ fontSize: 32, color: "#43a047" }} />
                    );
                    cardColor = "#f3f9f4";
                    titleColor = "#43a047";
                    break;
                  default:
                    icon = <InfoIcon sx={{ fontSize: 32, color: "#90a4ae" }} />;
                    cardColor = "#f5f5f5";
                    titleColor = "#222";
                }
                return (
                  <Box
                    key={idx}
                    sx={{
                      mb: 2,
                      p: 2,
                      borderRadius: 3,
                      bgcolor: cardColor,
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 2,
                      boxShadow: "0 2px 8px 0 rgba(60,72,100,0.06)",
                    }}
                  >
                    <Box sx={{ mt: 0.5 }}>{icon}</Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        fontWeight={700}
                        fontSize={18}
                        color={titleColor}
                        sx={{ mb: 0.5 }}
                      >
                        {event.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontWeight: 500, mb: 0.5 }}
                      >
                        {event.type} | {event.start_time}
                      </Typography>
                      <Typography variant="body2" color="#444">
                        {event.description}
                      </Typography>
                    </Box>
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
            gap: 0,
            width: "100%",
            border: "1px solid #ddd",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((w) => (
            <Typography
              key={w}
              align="center"
              fontWeight={600}
              color="#888"
              sx={{
                mb: 1,
                borderBottom: "1px solid #ddd",
                bgcolor: "#f5f5f5",
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
                    bgcolor: isToday ? "#336de122" : day ? "#fff" : "#f5f5f5",
                    borderRight: di < 6 ? "1px solid #ddd" : "none",
                    borderBottom: "1px solid #ddd",
                    borderTop: wi === 0 ? "none" : undefined,
                    borderLeft: di === 0 ? "none" : undefined,
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "flex-start",
                    p: 1,
                    position: "relative",
                    boxShadow: isToday ? 3 : 0,
                    border: isToday ? "1px solid #336de122" : undefined,
                    cursor: day ? "pointer" : "default",
                  }}
                  onClick={() => handleDateClick(day)}
                >
                  <Typography
                    variant="body1"
                    fontWeight={isToday ? 700 : 500}
                    color={isToday ? "#e1333b" : "#222"}
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
                                boxShadow: "0 1px 2px rgba(47, 40, 40, 0.13)",
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
                              boxShadow: "0 1px 2px rgba(47, 40, 40, 0.13)",
                            }}
                          />
                          <Box
                            sx={{
                              ml: 0.5,
                              px: 0.5,
                              minWidth: 16,
                              height: 16,
                              bgcolor: "#eee",
                              borderRadius: 8,
                              fontSize: 11,
                              fontWeight: 700,
                              color: "#444",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: "0 1px 2px rgba(47, 40, 40, 0.13)",
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
                    <CalendarTodayIcon sx={{ color: "#888" }} />
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
                    <DescriptionIcon sx={{ color: "#888" }} />
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
                    <LocalOfferIcon sx={{ color: "#888" }} />
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
                            <AccessTimeIcon sx={{ color: "#1976d2" }} />
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
                              <AccessTimeIcon sx={{ color: "#1976d2" }} />
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
                sx={{ minWidth: 100, fontWeight: 700 }}
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
