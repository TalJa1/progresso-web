import HorizontalNavigationBar from "../HorizontalNavigationBar";
import { Box } from "@mui/material";
const LearningView = () => {
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
        {/* render here */}
      </Box>
    </Box>
  );
};

export default LearningView;
