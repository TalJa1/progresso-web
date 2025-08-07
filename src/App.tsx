import { Routes, Route } from "react-router-dom";
import LoginView from "./views/LoginView";
import HomeView from "./views/main/HomeView";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginView />} />
      <Route path="/home" element={<HomeView />} />
    </Routes>
  );
}

export default App;
