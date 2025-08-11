import { useState } from "react";
import HorizontalNavigationBar from "../../components/HorizontalNavigationBar";
import { Box, Typography, IconButton } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

const ScheduleView = () => {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun

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
                  }}
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
      </Box>
    </Box>
  );
};

export default ScheduleView;
