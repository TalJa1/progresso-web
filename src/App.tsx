import { Routes, Route } from "react-router-dom";
import LoginView from "./views/LoginView";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginView />} />
    </Routes>
  );
}

export default App;
