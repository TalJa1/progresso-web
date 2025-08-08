import HorizontalNavigationBar from "../../components/HorizontalNavigationBar";
import { Box } from "@mui/material";

const SubmissionsView = () => {
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
          <h2>Submissions View</h2>
        </Box>
      </Box>
    </Box>
  );
};

export default SubmissionsView;
