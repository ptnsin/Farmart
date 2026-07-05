import { Routes, Route } from "react-router-dom";
import FarmartLogin from "./FarmartLogin";
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
import Checkout from "./Checkout";

// Employee
import EmployeeLayout from "./employee/EmployeeLayout";
import EmployeeOrders from "./employee/EmployeeOrders";
import EmployeeWarehouse from "./employee/EmployeeWarehouse";
import EmployeeProductAdd from "./employee/EmployeeProductAdd";
import EmployeeProductEdit from "./employee/EmployeeProductEdit";
import EmployeeShipping from "./employee/EmployeeShipping";
import EmployeeSettings from "./employee/EmployeeSettings";
import EmployeeSupport from "./employee/EmployeeSupport";

// Admin
import AdminUsers from "./admin/AdminUsers";
import AdminUserNew from "./admin/AdminUserNew";
import AdminProductApprovals from "./admin/AdminProductApprovals";
import AdminInventory from "./admin/AdminInventory";
import AdminProductDetail from "./admin/AdminProductDetail";
import AdminPromotions from "./admin/AdminPromotions";
import AdminReports from "./admin/AdminReports";
import AdminSettings from "./admin/AdminSettings";
import AdminSupport from "./admin/AdminSupport";

function App() {
  return (
    <Routes>
      <Route path="/" element={<FarmartLogin />} />
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
      <Route path="/checkout" element={<Checkout />} />

      {/* Employee Routes */}
      <Route path="/employee" element={<EmployeeLayout />}>
        <Route path="orders" element={<EmployeeOrders />} />
        <Route path="warehouse" element={<EmployeeWarehouse />} />
        <Route path="warehouse/add" element={<EmployeeProductAdd />} />
        <Route path="warehouse/edit/:id" element={<EmployeeProductEdit />} />
        <Route path="shipping" element={<EmployeeShipping />} />
        <Route path="settings" element={<EmployeeSettings />} />
        <Route path="support" element={<EmployeeSupport />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/admin/users/new" element={<AdminUserNew />} />
      <Route path="/admin/product-approvals" element={<AdminProductApprovals />} />
      <Route path="/admin/inventory" element={<AdminInventory />} />
      <Route path="/admin/inventory/:id" element={<AdminProductDetail />} />
      <Route path="/admin/promotions" element={<AdminPromotions />} />
      <Route path="/admin/reports" element={<AdminReports />} />
      <Route path="/admin/settings" element={<AdminSettings />} />
      <Route path="/admin/support" element={<AdminSupport />} />
    </Routes>
  );
}

export default App;
