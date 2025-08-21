import { Routes, Route } from "react-router-dom";
import LoginView from "./views/LoginView";
import HomeView from "./views/main/HomeView";
import ExamsView from "./views/main/ExamsView";
import ScheduleView from "./views/main/ScheduleView";
import SubmissionsView from "./views/main/SubmissionsView";
import ProfileView from "./views/user/ProfileView";
import LearningView from "./components/home/LearningView";
import QuizletView from "./components/home/QuizletView";
import ExamProcessView from "./views/exam/ExamProcessView";
import ExamRecordView from "./views/exam/ExamRecordView";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginView />} />
      <Route path="/home" element={<HomeView />} />
      <Route path="/exams" element={<ExamsView />} />
      <Route path="/submissions" element={<SubmissionsView />} />
      <Route path="/schedule" element={<ScheduleView />} />
      <Route path="/profile" element={<ProfileView />} />
      <Route path="/quizlet/:lessonId" element={<QuizletView />} />
      <Route path="/learning/:id" element={<LearningView />} />
      <Route path="/exam-process/:examId" element={<ExamProcessView />} />
      <Route path="/exam-record/:submissionId/:examId" element={<ExamRecordView />} />
    </Routes>
  );
}

export default App;
