import { Routes, Route } from "react-router-dom";
import AgriHarvestLogin from "./AgriHarvestLogin";
import Register from "./Register";
import Home from "./Home";
import Dashboard from "./Dashboard";
import Products from "./Products";
import Profile from "./Profile";
import ProductDetail from "./ProductDetail";
import Tracking from "./Tracking";

function App() {
  return (
    <Routes>
      <Route path="/" element={<AgriHarvestLogin />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/products" element={<Products />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/tracking" element={<Tracking />} />
    </Routes>
  );
}

export default App;
