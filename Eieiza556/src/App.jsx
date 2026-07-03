import { Routes, Route } from "react-router-dom";
import AgriHarvestLogin from "./AgriHarvestLogin";
import Register from "./Register";
import Home from "./Home";
import Dashboard from "./Dashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<AgriHarvestLogin />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
