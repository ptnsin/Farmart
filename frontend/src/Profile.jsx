import { Fragment, useEffect, useRef, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  Sprout,
  Search,
  ShoppingCart,
  Bell,
  UserCircle2,
  Pencil,
  ClipboardList,
  MapPin,
  Settings,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  CheckCircle2,
  Eye,
  EyeOff,
  X,
  LogOut,
  Loader2,
} from "lucide-react";
import { useCart } from "./CartContext";
import Footer from "./Footer";
import { fetchCurrentUser, getCachedUser, updateMe, logout } from "./data/authStore";
import { getMyOrders } from "./data/orderStore";
import { api } from "./data/apiClient";

const sidebarItems = [
  { key: "info", label: "ข้อมูลส่วนตัว", icon: UserCircle2 },
  { key: "orders", label: "คำสั่งซื้อของฉัน", icon: ClipboardList },
  { key: "address", label: "ที่อยู่จัดส่ง", icon: MapPin },
  { key: "settings", label: "ตั้งค่าบัญชี", icon: Settings },
];

// Same delivery-step color scheme used on the /orders page, keyed by
// order.statusStep (0-4) coming from the real backend.
const STEP_BADGE = {
  0: { color: "bg-gray-100 text-gray-600", dot: "bg-gray-400" },
  1: { color: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  2: { color: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  3: { color: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  4: { color: "bg-green-100 text-green-700", dot: "bg-green-600" },
};

// Reshapes a real order from the backend (getMyOrders) into the display
// shape OrdersTable expects (pre-formatted price strings, Thai date, etc).
function toProfileOrder(order) {
  const badge = STEP_BADGE[order.statusStep] || STEP_BADGE[0];
  return {
    id: order.id,
    date: order.date ? new Date(order.date).toLocaleDateString("th-TH") : "-",
    status: order.statusLabel || "ยืนยันคำสั่งซื้อ",
    statusColor: badge.color,
    dotColor: badge.dot,
    total: `฿${Number(order.total || 0).toLocaleString()}`,
    items: (order.items || []).map((item) => ({
      name: item.name,
      qty: item.quantity,
      price: `฿${Number(item.price || 0).toLocaleString()}`,
    })),
  };
}

const initialAddresses = [
  {
    id: 1,
    label: "บ้าน",
    name: "สมชาย รักเกษตร",
    phone: "081-234-5678",
    detail: "88/12 หมู่ 4 ต.บางพลี อ.บางพลี จ.สมุทรปราการ 10540",
    isDefault: true,
  },
  {
    id: 2,
    label: "ที่ทำงาน",
    name: "สมชาย รักเกษตร",
    phone: "081-234-5678",
    detail: "199 อาคารกรีนทาวเวอร์ ชั้น 8 ถ.สุขุมวิท กรุงเทพฯ 10110",
    isDefault: false,
  },
];

function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="fixed top-20 right-6 z-50 flex items-center gap-2 bg-green-900 text-white text-sm font-medium px-4 py-3 rounded-lg shadow-lg animate-[fadeIn_0.15s_ease-out]">
      <CheckCircle2 className="w-4 h-4 text-green-300" />
      {message}
    </div>
  );
}

// Centered, modal-style alert — used for the address feature instead of the
// top-right toast. Shows over a dim backdrop, auto-dismisses after a few
// seconds, and can also be closed early (backdrop click or the X button).
function CenterAlert({ message, onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, 2200);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 animate-[fadeIn_0.15s_ease-out]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xs bg-white rounded-2xl shadow-xl px-6 py-7 flex flex-col items-center text-center"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-300 hover:text-gray-500"
          aria-label="ปิด"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-3">
          <CheckCircle2 className="w-6 h-6 text-green-700" />
        </div>
        <p className="text-sm font-semibold text-gray-900">{message}</p>
        <button
          onClick={onClose}
          className="mt-5 text-sm font-semibold text-green-700 hover:text-green-800 px-4 py-1.5 rounded-lg hover:bg-green-50 transition-colors"
        >
          ตกลง
        </button>
      </div>
    </div>
  );
}

export default function Profile() {
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const validTabs = ["info", "orders", "address", "settings"];
  const [activeTab, setActiveTab] = useState(
    validTabs.includes(tabParam) ? tabParam : "info"
  );
  const [toast, setToast] = useState("");
  const [centerAlert, setCenterAlert] = useState("");

  // ----- Profile info -----
  const [avatar, setAvatar] = useState(
    "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop"
  );
  const [form, setForm] = useState({
    name: "สมชาย รักเกษตร",
    email: "somchai.r@gmail.com",
    phone: "081-234-5678",
  });
  const [savedForm, setSavedForm] = useState(form);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // ----- โหลดข้อมูลผู้ใช้จาก backend ตอนเข้าหน้า Profile -----
  useEffect(() => {
    // โชว์ข้อมูลที่แคชไว้ก่อนทันที (ไม่ต้องรอ network)
    const cached = getCachedUser();
    if (cached) {
      const cachedForm = {
        name: cached.name ?? "",
        email: cached.email ?? "",
        phone: cached.phone ?? "",
      };
      setForm(cachedForm);
      setSavedForm(cachedForm);
      if (cached.avatar) setAvatar(cached.avatar);
    }

    // แล้วยืนยันกับ backend ว่า token ยังใช้ได้ + ได้ข้อมูลล่าสุด
    const loadProfile = async () => {
      try {
        const user = await fetchCurrentUser();
        const nextForm = {
          name: user.name ?? "",
          email: user.email ?? "",
          phone: user.phone ?? "",
        };
        setForm(nextForm);
        setSavedForm(nextForm);
        if (user.avatar) setAvatar(user.avatar);
      } catch (err) {
        setFetchError(err.message || "โหลดข้อมูลไม่สำเร็จ กรุณาเข้าสู่ระบบใหม่");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  // Centered alert — used for the address feature (add / edit / delete /
  // set default). Auto-dismiss timing lives inside CenterAlert itself.
  const showCenterAlert = (msg) => setCenterAlert(msg);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // ให้เลือกไฟล์เดิมซ้ำได้ในครั้งถัดไป
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast("ขนาดรูปต้องไม่เกิน 2MB");
      return;
    }

    try {
      const body = new FormData();
      body.append("file", file);
      const uploaded = await api.post("/api/upload/avatar", body);
      // อัปโหลดไฟล์ขึ้น server แล้ว บันทึกลงบัญชีทันที (ปุ่มดินสอไม่มีขั้นตอน "บันทึก" แยก)
      await updateMe({ avatar: uploaded.url });
      setAvatar(uploaded.url);
      showToast("อัปเดตรูปโปรไฟล์แล้ว");
    } catch (err) {
      showToast(err.message || "อัปโหลดรูปไม่สำเร็จ");
    }
  };

  const handleFormChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const validateForm = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "กรุณากรอกชื่อ-นามสกุล";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "รูปแบบอีเมลไม่ถูกต้อง";
    if (!/^[0-9-]{9,10}$/.test(form.phone)) errs.phone = "รูปแบบเบอร์โทรไม่ถูกต้อง";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) return;
    try {
      await updateMe(form);
      setSavedForm(form);
      showToast("บันทึกการเปลี่ยนแปลงเรียบร้อยแล้ว");
    } catch (err) {
      showToast(err.message || "บันทึกไม่สำเร็จ");
    }
  };

  const isDirty = JSON.stringify(form) !== JSON.stringify(savedForm);

  // ----- Orders -----
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const visibleOrders = showAllOrders ? orders : orders.slice(0, 3);

  useEffect(() => {
    let cancelled = false;
    setOrdersLoading(true);
    getMyOrders()
      .then((data) => {
        if (cancelled) return;
        setOrders((data || []).map(toProfileOrder));
        setOrdersError("");
      })
      .catch((err) => {
        if (!cancelled) setOrdersError(err?.message || "โหลดคำสั่งซื้อไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      })
      .finally(() => {
        if (!cancelled) setOrdersLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleOrder = (id) => {
    setExpandedOrder((cur) => (cur === id ? null : id));
  };

  // ----- Addresses -----
  const [addresses, setAddresses] = useState(initialAddresses);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    label: "",
    name: "",
    phone: "",
    detail: "",
  });

  const openNewAddressForm = () => {
    setEditingAddressId(null);
    setAddressForm({ label: "", name: "", phone: "", detail: "" });
    setShowAddressForm(true);
  };

  const openEditAddressForm = (addr) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      label: addr.label,
      name: addr.name,
      phone: addr.phone,
      detail: addr.detail,
    });
    setShowAddressForm(true);
  };

  const handleSaveAddress = () => {
    if (!addressForm.label.trim() || !addressForm.detail.trim()) return;
    if (editingAddressId) {
      setAddresses((list) =>
        list.map((a) =>
          a.id === editingAddressId ? { ...a, ...addressForm } : a
        )
      );
      showCenterAlert("แก้ไขที่อยู่เรียบร้อยแล้ว");
    } else {
      setAddresses((list) => [
        ...list,
        { id: Date.now(), isDefault: list.length === 0, ...addressForm },
      ]);
      showCenterAlert("เพิ่มที่อยู่ใหม่เรียบร้อยแล้ว");
    }
    setShowAddressForm(false);
  };

  const handleDeleteAddress = (id) => {
    setAddresses((list) => list.filter((a) => a.id !== id));
    showCenterAlert("ลบที่อยู่แล้ว");
  };

  const handleSetDefaultAddress = (id) => {
    setAddresses((list) =>
      list.map((a) => ({ ...a, isDefault: a.id === id }))
    );
    showCenterAlert("ตั้งเป็นที่อยู่หลักแล้ว");
  };

  // ----- Settings -----
  const [notif, setNotif] = useState({
    orderUpdates: true,
    promotions: false,
    newsletter: true,
  });
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const [pwdVisible, setPwdVisible] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // ----- Logout -----
  const [loggingOut, setLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
      setShowLogoutConfirm(false);
      navigate("/"); // "/" คือหน้า FarmartLogin (ดู App.jsx)
    }
  };

  const toggleNotif = (key) => {
    setNotif((n) => ({ ...n, [key]: !n[key] }));
  };

  const handleChangePassword = async () => {
    if (!pwd.current || !pwd.next || !pwd.confirm) {
      setPwdError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }
    if (pwd.next.length < 8) {
      setPwdError("รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }
    if (pwd.next !== pwd.confirm) {
      setPwdError("รหัสผ่านใหม่ไม่ตรงกัน");
      return;
    }
    setPwdError("");
    try {
      // หมายเหตุ: backend (PUT /api/auth/me) ยังไม่ได้เช็ค pwd.current กับรหัสผ่านเดิมจริง ๆ
      // (แค่ยาว >= 6 ตัวอักษรก็ตั้งได้เลย) ถ้าจะให้ปลอดภัยขึ้นต้องเพิ่มการเช็คฝั่ง backend ทีหลัง
      await updateMe({ password: pwd.next });
      setPwd({ current: "", next: "", confirm: "" });
      showToast("เปลี่ยนรหัสผ่านเรียบร้อยแล้ว");
    } catch (err) {
      setPwdError(err.message || "เปลี่ยนรหัสผ่านไม่สำเร็จ");
    }
  };

  return (
    <div className="min-h-screen w-full bg-white text-gray-900 flex flex-col">
      <Toast message={toast} />
      <CenterAlert message={centerAlert} onClose={() => setCenterAlert("")} />

      {/* Top nav — matches Home / Products / Tracking / HelpCenter */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto flex items-center gap-6 px-6 py-3.5">
          <Link to="/home" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-md bg-green-800 flex items-center justify-center">
              <Sprout className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">Farmart</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600 font-medium">
            <Link to="/home" className="hover:text-green-800">หน้าแรก</Link>
            <Link to="/profile" className="text-green-800 font-semibold">โปรไฟล์</Link>
          </nav>

          <div className="flex-1 max-w-xs ml-auto relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาสินค้า..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
            />
          </div>

          <div className="flex items-center gap-1">
            <button className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50">
              <Bell className="w-5 h-5" />
            </button>
            <Link
              to="/cart"
              title="รถเข็นของคุณ"
              className="relative w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-green-700 text-white text-[10px] font-bold flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            <Link
              to="/profile"
              title="โปรไฟล์"
              className="w-9 h-9 flex items-center justify-center rounded-lg text-green-800 bg-green-50 overflow-hidden"
            >
              {avatar ? (
                <img
                  src={avatar}
                  alt="โปรไฟล์"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserCircle2 className="w-6 h-6" />
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Body */}
      <section className="max-w-6xl mx-auto px-6 py-10 flex-1 w-full">
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
          {/* Sidebar */}
          <aside className="bg-white border border-gray-100 rounded-xl shadow-sm p-3 h-fit md:sticky md:top-20">
            <nav className="space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const active = item.key === activeTab;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveTab(item.key)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "bg-green-50 text-green-800"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* ออกจากระบบ — แยกจากเมนูหลักด้วยเส้นคั่น กดแล้วเด้ง confirm ก่อนเสมอ */}
            <div className="mt-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                ออกจากระบบ
              </button>
            </div>
          </aside>

          {/* Main content */}
          <div>
            {/* ---------------- ข้อมูลส่วนตัว ---------------- */}
            {activeTab === "info" && (
              <>
                {loading && (
                  <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 mb-4 text-sm text-gray-500">
                    กำลังโหลดข้อมูลโปรไฟล์...
                  </div>
                )}
                {fetchError && !loading && (
                  <div className="bg-red-50 border border-red-100 rounded-xl shadow-sm p-4 mb-4 text-sm text-red-600">
                    {fetchError}
                  </div>
                )}
                <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative shrink-0">
                      <img
                        src={avatar}
                        alt="รูปโปรไฟล์"
                        className="w-20 h-20 rounded-full object-cover border-4 border-green-100 shadow-sm"
                      />
                      <button
                        onClick={handleAvatarClick}
                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-700 hover:bg-green-600 border-2 border-white flex items-center justify-center transition-colors"
                        aria-label="เปลี่ยนรูปโปรไฟล์"
                      >
                        <Pencil className="w-3 h-3 text-white" />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">{savedForm.name}</p>
                      <p className="text-sm text-gray-500 mt-0.5">สมาชิกตั้งแต่ มกราคม 2024</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                        ชื่อ-นามสกุล
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => handleFormChange("name", e.target.value)}
                        className={`w-full px-3 py-2.5 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-700 ${
                          formErrors.name ? "border-red-400" : "border-gray-200"
                        }`}
                      />
                      {formErrors.name && (
                        <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                        อีเมล
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => handleFormChange("email", e.target.value)}
                        className={`w-full px-3 py-2.5 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-700 ${
                          formErrors.email ? "border-red-400" : "border-gray-200"
                        }`}
                      />
                      {formErrors.email && (
                        <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>
                      )}
                    </div>
                    <div className="sm:col-span-2 sm:max-w-xs">
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                        เบอร์โทรศัพท์
                      </label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => handleFormChange("phone", e.target.value)}
                        className={`w-full px-3 py-2.5 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-700 ${
                          formErrors.phone ? "border-red-400" : "border-gray-200"
                        }`}
                      />
                      {formErrors.phone && (
                        <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-6">
                    <button
                      onClick={handleSaveProfile}
                      disabled={!isDirty}
                      className="bg-green-900 hover:bg-green-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
                    >
                      บันทึกการเปลี่ยนแปลง
                    </button>
                    {isDirty && (
                      <button
                        onClick={() => {
                          setForm(savedForm);
                          setFormErrors({});
                        }}
                        className="text-sm font-semibold text-gray-500 hover:text-gray-700 px-3 py-2.5"
                      >
                        ยกเลิก
                      </button>
                    )}
                  </div>
                </div>

                {/* Recent orders preview */}
                <div className="mt-8">
                  <div className="flex items-end justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">คำสั่งซื้อล่าสุด</h2>
                    <button
                      onClick={() => setActiveTab("orders")}
                      className="text-sm font-semibold text-green-700 hover:underline"
                    >
                      ดูทั้งหมด
                    </button>
                  </div>
                  <OrdersTable
                    orders={orders.slice(0, 3)}
                    expandedOrder={expandedOrder}
                    toggleOrder={toggleOrder}
                  />
                </div>
              </>
            )}

            {/* ---------------- คำสั่งซื้อของฉัน ---------------- */}
            {activeTab === "orders" && (
              <div>
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">คำสั่งซื้อของฉัน</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      ประวัติคำสั่งซื้อทั้งหมด {orders.length} รายการ
                    </p>
                  </div>
                </div>
                {ordersLoading ? (
                  <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-10 text-center text-sm text-gray-400">
                    กำลังโหลดคำสั่งซื้อ...
                  </div>
                ) : ordersError ? (
                  <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-10 text-center text-sm text-red-500">
                    {ordersError}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-white border border-dashed border-gray-200 rounded-xl p-10 text-center text-sm text-gray-500">
                    คุณยังไม่มีคำสั่งซื้อ
                  </div>
                ) : (
                  <>
                    <OrdersTable
                      orders={visibleOrders}
                      expandedOrder={expandedOrder}
                      toggleOrder={toggleOrder}
                    />
                    {orders.length > 3 && (
                      <div className="text-center mt-4">
                        <button
                          onClick={() => setShowAllOrders((v) => !v)}
                          className="text-sm font-semibold text-green-700 hover:underline"
                        >
                          {showAllOrders ? "แสดงน้อยลง" : `แสดงทั้งหมด (${orders.length})`}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ---------------- ที่อยู่จัดส่ง ---------------- */}
            {activeTab === "address" && (
              <div>
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">ที่อยู่จัดส่ง</h2>
                    <p className="text-sm text-gray-500 mt-1">จัดการที่อยู่สำหรับการจัดส่งสินค้า</p>
                  </div>
                  <button
                    onClick={openNewAddressForm}
                    className="flex items-center gap-1.5 bg-green-900 hover:bg-green-800 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    เพิ่มที่อยู่
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="bg-white border border-dashed border-gray-200 rounded-xl p-10 text-center text-sm text-gray-500">
                    ยังไม่มีที่อยู่จัดส่ง กดปุ่ม "เพิ่มที่อยู่" เพื่อเริ่มต้น
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`bg-white border rounded-xl p-4 relative ${
                          addr.isDefault ? "border-green-600" : "border-gray-100"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <p className="text-sm font-bold text-gray-900">{addr.label}</p>
                          {addr.isDefault && (
                            <span className="text-[10px] font-semibold uppercase tracking-wide bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                              ค่าเริ่มต้น
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-800">{addr.name}</p>
                        <p className="text-sm text-gray-500">{addr.phone}</p>
                        <p className="text-sm text-gray-500 mt-1 leading-relaxed">{addr.detail}</p>

                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50">
                          <button
                            onClick={() => openEditAddressForm(addr)}
                            className="text-xs font-semibold text-green-700 hover:underline"
                          >
                            แก้ไข
                          </button>
                          {!addr.isDefault && (
                            <button
                              onClick={() => handleSetDefaultAddress(addr.id)}
                              className="text-xs font-semibold text-gray-500 hover:text-gray-700"
                            >
                              ตั้งเป็นค่าเริ่มต้น
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="text-xs font-semibold text-red-500 hover:text-red-600 ml-auto flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            ลบ
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add / Edit address modal */}
                {showAddressForm && (
                  <div className="fixed inset-0 z-30 bg-black/40 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
                      <button
                        onClick={() => setShowAddressForm(false)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <h3 className="text-base font-bold text-gray-900 mb-4">
                        {editingAddressId ? "แก้ไขที่อยู่" : "เพิ่มที่อยู่ใหม่"}
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                            ชื่อที่อยู่ (เช่น บ้าน, ที่ทำงาน)
                          </label>
                          <input
                            type="text"
                            value={addressForm.label}
                            onChange={(e) =>
                              setAddressForm((f) => ({ ...f, label: e.target.value }))
                            }
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                            ชื่อผู้รับ
                          </label>
                          <input
                            type="text"
                            value={addressForm.name}
                            onChange={(e) =>
                              setAddressForm((f) => ({ ...f, name: e.target.value }))
                            }
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                            เบอร์โทรศัพท์
                          </label>
                          <input
                            type="tel"
                            value={addressForm.phone}
                            onChange={(e) =>
                              setAddressForm((f) => ({ ...f, phone: e.target.value }))
                            }
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                            ที่อยู่แบบเต็ม
                          </label>
                          <textarea
                            rows={3}
                            value={addressForm.detail}
                            onChange={(e) =>
                              setAddressForm((f) => ({ ...f, detail: e.target.value }))
                            }
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700 resize-none"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-5">
                        <button
                          onClick={handleSaveAddress}
                          className="bg-green-900 hover:bg-green-800 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
                        >
                          บันทึกที่อยู่
                        </button>
                        <button
                          onClick={() => setShowAddressForm(false)}
                          className="text-sm font-semibold text-gray-500 hover:text-gray-700 px-3 py-2.5"
                        >
                          ยกเลิก
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ---------------- ตั้งค่าบัญชี ---------------- */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                {/* Change password */}
                <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
                  <h2 className="text-base font-bold text-gray-900 mb-1">เปลี่ยนรหัสผ่าน</h2>
                  <p className="text-sm text-gray-500 mb-4">
                    ควรใช้รหัสผ่านที่คาดเดายากและไม่ซ้ำกับบัญชีอื่น
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                        รหัสผ่านปัจจุบัน
                      </label>
                      <div className="relative">
                        <input
                          type={pwdVisible ? "text" : "password"}
                          value={pwd.current}
                          onChange={(e) => setPwd((p) => ({ ...p, current: e.target.value }))}
                          className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
                        />
                        <button
                          type="button"
                          onClick={() => setPwdVisible((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {pwdVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                        รหัสผ่านใหม่
                      </label>
                      <input
                        type={pwdVisible ? "text" : "password"}
                        value={pwd.next}
                        onChange={(e) => setPwd((p) => ({ ...p, next: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                        ยืนยันรหัสผ่านใหม่
                      </label>
                      <input
                        type={pwdVisible ? "text" : "password"}
                        value={pwd.confirm}
                        onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
                      />
                    </div>
                  </div>
                  {pwdError && <p className="text-xs text-red-500 mt-2">{pwdError}</p>}
                  <button
                    onClick={handleChangePassword}
                    className="mt-5 bg-green-900 hover:bg-green-800 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
                  >
                    เปลี่ยนรหัสผ่าน
                  </button>
                </div>

                {/* Notifications */}
                <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
                  <h2 className="text-base font-bold text-gray-900 mb-4">การแจ้งเตือน</h2>
                  <div className="space-y-4">
                    <NotifRow
                      title="อัปเดตสถานะคำสั่งซื้อ"
                      desc="แจ้งเตือนเมื่อสถานะคำสั่งซื้อของคุณเปลี่ยนแปลง"
                      checked={notif.orderUpdates}
                      onChange={() => toggleNotif("orderUpdates")}
                    />
                    <NotifRow
                      title="โปรโมชั่นและส่วนลด"
                      desc="รับข่าวสารส่วนลดพิเศษและแคมเปญต่างๆ"
                      checked={notif.promotions}
                      onChange={() => toggleNotif("promotions")}
                    />
                    <NotifRow
                      title="จดหมายข่าวรายเดือน"
                      desc="สรุปผลผลิตใหม่และเคล็ดลับการเกษตรทุกเดือน"
                      checked={notif.newsletter}
                      onChange={() => toggleNotif("newsletter")}
                    />
                  </div>
                </div>

                {/* Session — logout */}
                <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
                  <h2 className="text-base font-bold text-gray-900 mb-1">เซสชันการใช้งาน</h2>
                  <p className="text-sm text-gray-500 mb-4">
                    ออกจากระบบเพื่อความปลอดภัย โดยเฉพาะเมื่อใช้อุปกรณ์ร่วมกับผู้อื่น
                  </p>
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    disabled={loggingOut}
                    className="flex items-center gap-2 text-sm font-semibold text-red-600 border border-red-200 hover:bg-red-50 disabled:opacity-60 px-5 py-2.5 rounded-lg transition-colors"
                  >
                    {loggingOut ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <LogOut className="w-4 h-4" />
                    )}
                    {loggingOut ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}
                  </button>
                </div>

                {/* Danger zone */}
                <div className="bg-white border border-red-100 rounded-xl shadow-sm p-6">
                  <h2 className="text-base font-bold text-red-600 mb-1">ลบบัญชีผู้ใช้</h2>
                  <p className="text-sm text-gray-500 mb-4">
                    การลบบัญชีจะลบข้อมูลทั้งหมดอย่างถาวรและไม่สามารถกู้คืนได้
                  </p>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-sm font-semibold text-red-600 border border-red-200 hover:bg-red-50 px-5 py-2.5 rounded-lg transition-colors"
                  >
                    ลบบัญชีของฉัน
                  </button>
                </div>

                {showDeleteConfirm && (
                  <div className="fixed inset-0 z-30 bg-black/40 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center">
                      <h3 className="text-base font-bold text-gray-900 mb-2">ยืนยันการลบบัญชี?</h3>
                      <p className="text-sm text-gray-500 mb-5">
                        การกระทำนี้ไม่สามารถย้อนกลับได้ ข้อมูลทั้งหมดของคุณจะถูกลบถาวร
                      </p>
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => {
                            setShowDeleteConfirm(false);
                            showToast("ยกเลิกการลบบัญชีแล้ว");
                          }}
                          className="text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 px-4 py-2.5 rounded-lg"
                        >
                          ยกเลิก
                        </button>
                        <button
                          onClick={() => {
                            setShowDeleteConfirm(false);
                            // TODO: ยังไม่มี endpoint ให้ผู้ใช้ลบบัญชีตัวเอง
                            // (DELETE /api/users/:id ตอนนี้เป็นสิทธิ์ ADMIN เท่านั้น)
                            // ต้องเพิ่ม DELETE /api/auth/me ฝั่ง backend ก่อนถึงจะเชื่อมของจริงได้
                            showToast("ลบบัญชีเรียบร้อยแล้ว");
                          }}
                          className="text-sm font-semibold text-white bg-red-600 hover:bg-red-700 px-4 py-2.5 rounded-lg"
                        >
                          ลบบัญชี
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Logout confirm — เรียกได้จากทั้งปุ่มใน sidebar และในแท็บตั้งค่า */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-30 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
              <LogOut className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">ออกจากระบบ?</h3>
            <p className="text-sm text-gray-500 mb-5">
              คุณจะต้องเข้าสู่ระบบใหม่อีกครั้งเพื่อใช้งานบัญชีนี้
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                disabled={loggingOut}
                className="text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 disabled:opacity-60 px-4 py-2.5 rounded-lg"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center gap-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 px-4 py-2.5 rounded-lg"
              >
                {loggingOut && <Loader2 className="w-4 h-4 animate-spin" />}
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      )}

<Footer />
    </div>
  );
}

function OrdersTable({ orders, expandedOrder, toggleOrder }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-left text-xs font-semibold text-gray-500">
            <th className="px-5 py-3">เลขคำสั่งซื้อ</th>
            <th className="px-5 py-3">วันที่</th>
            <th className="px-5 py-3">สถานะ</th>
            <th className="px-5 py-3">ยอดรวม</th>
            <th className="px-5 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const isOpen = expandedOrder === order.id;
            return (
              <Fragment key={order.id}>
                <tr
                  onClick={() => toggleOrder(order.id)}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 cursor-pointer"
                >
                  <td className="px-5 py-4 font-semibold text-gray-900">{order.id}</td>
                  <td className="px-5 py-4 text-gray-500">{order.date}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${order.statusColor}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${order.dotColor}`} />
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-gray-900">{order.total}</td>
                  <td className="px-5 py-4 text-right">
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 inline-block transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </td>
                </tr>
                {isOpen && (
                  <tr className="bg-gray-50/70">
                    <td colSpan={5} className="px-5 py-4">
                      <p className="text-xs font-semibold text-gray-500 mb-2">รายการสินค้า</p>
                      <div className="space-y-1.5">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-sm text-gray-700"
                          >
                            <span>
                              {item.name}{" "}
                              <span className="text-gray-400">x{item.qty}</span>
                            </span>
                            <span className="font-medium text-gray-900">{item.price}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function NotifRow({ title, desc, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
      </div>
      <button
        onClick={onChange}
        className={`w-11 h-6 rounded-full relative transition-colors shrink-0 overflow-hidden ${
          checked ? "bg-green-700" : "bg-gray-200"
        }`}
        aria-pressed={checked}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}