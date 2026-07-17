import { Routes, Route } from "react-router-dom";

// Customer
import FarmartLogin from "./FarmartLogin";  //หน้า Login
import FarmartForgotPassword from "./FarmartForgotPassword";  //หน้าลืมรหัสผ่าน
import FarmartResetPassword from "./FarmartResetPassword";  //หน้าตั้งรหัสผ่านใหม่
import Register from "./Register";  //หน้าสมัครสมาชิก
import Home from "./Home";  //หน้า Home
import Dashboard from "./Dashboard";  //หน้าเหี้ยไร
import Products from "./Products";   //หน้าสินค้า
import Profile from "./Profile";   //หน้าโปรไฟล์
import ProductDetail from "./ProductDetail";   //หน้าดูรายละเอียดสินค้า
import Tracking from "./Tracking";   //หน้าติดตามพัสดุ
import Cart from "./Cart";   //หน้าตะกร้า
import Order from "./Order";   //หน้าสั่งซื้อ
import Checkout from "./Checkout";   //หน้าชำระเงิน
import HelpCenter from "./HelpCenter";   //หน้าศูนย์ช่วยเหลือ


// Employee
import EmployeeOrders from "./employee/EmployeeOrders";
import EmployeeWarehouse from "./employee/EmployeeWarehouse";
import EmployeeProductAdd from "./employee/EmployeeProductAdd";
import EmployeeProductEdit from "./employee/EmployeeProductEdit";
import EmployeeShipping from "./employee/EmployeeShipping";
import EmployeeSettings from "./employee/EmployeeSettings";
import EmployeeSupport from "./employee/EmployeeSupport";
import EmployeeProfile from "./employee/EmployeeProfile";

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
      {/* Customer Routes */}
      <Route path="/" element={<FarmartLogin />} />
      <Route path="/forgot-password" element={<FarmartForgotPassword />} />
      <Route path="/reset-password" element={<FarmartResetPassword />} />
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
      <Route path="/help-center" element={<HelpCenter />} />

      {/* Employee Routes */}
      <Route path="/employee/orders" element={<EmployeeOrders />} />
      <Route path="/employee/warehouse" element={<EmployeeWarehouse />} />
      <Route path="/employee/warehouse/add" element={<EmployeeProductAdd />} />
      <Route path="/employee/warehouse/edit/:id" element={<EmployeeProductEdit />} />
      <Route path="/employee/shipping" element={<EmployeeShipping />} />
      <Route path="/employee/settings" element={<EmployeeSettings />} />
      <Route path="/employee/support" element={<EmployeeSupport />} />
      <Route path="/employee/profile" element={<EmployeeProfile />} />

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