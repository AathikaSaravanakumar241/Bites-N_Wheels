import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/login.jsx";
import Register from "./pages/Register.jsx";
import TruckOwnerDashboard from "./pages/TruckOwnerDashboard";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/TruckOwnerDashboard" element={<TruckOwnerDashboard />} />0  1 1
    </Routes>
  );
}

export default App;