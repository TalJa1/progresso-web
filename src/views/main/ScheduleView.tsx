import { useState } from "react";
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
  InputAdornment,
  MenuItem,
} from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DescriptionIcon from "@mui/icons-material/Description";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const SCHEDULE_TYPES = ["Homework", "Exam", "Group Meeting", "Event"];

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
  const [createDate, setCreateDate] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "",
    start_time: "",
    event_date: "",
  });

  // Build calendar grid
  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarCells.push(null); // Empty cells before 1st
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }
  // 7 columns per week
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < calendarCells.length; i += 7) {
    weeks.push(calendarCells.slice(i, i + 7));
  }

  // Month navigation
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

  // Handle create event dialog
  const handleDateClick = (day: number | null) => {
    if (!day) return;
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;
    setForm({
      title: "",
      description: "",
      type: "",
      start_time: "",
      event_date: dateStr,
    });
    setCreateOpen(true);
  };
  const handleCreateClose = () => {
    setCreateOpen(false);
    setCreateDate(null);
  };
  const handleCreateSubmit = () => {
    // TODO: Call createSchedule API here
    handleCreateClose();
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
          alignItems: "flex-start",
        }}
      >
        {/* Render here */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
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
                </Box>
              );
            })
          )}
        </Box>
        {/* Create Schedule Dialog */}
        <Dialog
          open={createOpen}
          onClose={handleCreateClose}
          PaperProps={{ sx: { borderRadius: 4, minWidth: 340, p: 0 } }}
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
              <TextField
                label="Date"
                fullWidth
                margin="normal"
                value={form.event_date}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarTodayIcon sx={{ color: "#888" }} />
                    </InputAdornment>
                  ),
                  readOnly: true,
                }}
                sx={{ flex: 1 }}
              />
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
                      const minutes = String(value.getMinutes()).padStart(2, "0");
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
              </LocalizationProvider>
            </Box>
            <Box mt={3} display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                sx={{ minWidth: 100, fontWeight: 700 }}
                onClick={handleCreateSubmit}
                disabled={!form.title}
              >
                Create
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    </Box>
  );
};

export default ScheduleView;
