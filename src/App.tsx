import { Routes, Route } from "react-router-dom";
import LoginView from "./views/LoginView";
import HomeView from "./views/main/HomeView";
import ExamsView from "./views/main/ExamsView";
import ScheduleView from "./views/main/ScheduleView";
import SubmissionsView from "./views/main/SubmissionsView";
import ProfileView from "./views/user/ProfileView";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginView />} />
      <Route path="/home" element={<HomeView />} />
      <Route path="/exams" element={<ExamsView />} />
      <Route path="/submissions" element={<SubmissionsView />} />
      <Route path="/schedule" element={<ScheduleView />} />
      <Route path="/profile" element={<ProfileView />} />
    </Routes>
  );
}

export default App;
