import { Routes, Route } from "react-router-dom";
import AgriHarvestLogin from "./AgriHarvestLogin";
// Customer
import Register from "./Register";
import Home from "./Home";
import Dashboard from "./Dashboard";
import Products from "./Products";
import Profile from "./Profile";
import ProductDetail from "./ProductDetail";
import Tracking from "./Tracking";
import Cart from "./Cart";
import Order from "./Order";

// Admin
import AdminUsers from "./admin/AdminUsers";
import AdminOrders from "./admin/AdminOrders";
import AdminInventory from "./admin/AdminInventory";
import AdminProductNew from "./admin/AdminProductNew";
import AdminShipping from "./admin/AdminShipping";

function App() {
  return (
    <Routes>
      <Route path="/" element={<AgriHarvestLogin />} />
      {/* Customer Routes */}
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/products" element={<Products />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/tracking" element={<Tracking />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/orders" element={<Order />} />
      {/* Admin Routes */}
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/admin/orders" element={<AdminOrders />} />
      <Route path="/admin/inventory" element={<AdminInventory />} />
      <Route path="/admin/inventory/new" element={<AdminProductNew />} />
      <Route path="/admin/shipping" element={<AdminShipping />} />

    </Routes>
  );
}

export default App;
