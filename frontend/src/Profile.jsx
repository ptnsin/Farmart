import { Fragment, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
} from "lucide-react";
import { useCart } from "./CartContext";

const sidebarItems = [
  { key: "info", label: "ข้อมูลส่วนตัว", icon: UserCircle2 },
  { key: "orders", label: "คำสั่งซื้อของฉัน", icon: ClipboardList },
  { key: "address", label: "ที่อยู่จัดส่ง", icon: MapPin },
  { key: "settings", label: "ตั้งค่าบัญชี", icon: Settings },
];

const initialOrders = [
  {
    id: "#AH-89421",
    date: "12 มี.ค. 2567",
    status: "สำเร็จแล้ว",
    statusColor: "bg-green-100 text-green-700",
    dotColor: "bg-green-600",
    total: "฿1,450.00",
    items: [
      { name: "เมล็ดพันธุ์ผสม", qty: 2, price: "฿170.00" },
      { name: "ปุ๋ยอินทรีย์ (5 กก.)", qty: 1, price: "฿1,250.00" },
    ],
  },
  {
    id: "#AH-89304",
    date: "05 มี.ค. 2567",
    status: "กำลังจัดส่ง",
    statusColor: "bg-amber-100 text-amber-700",
    dotColor: "bg-amber-500",
    total: "฿890.00",
    items: [
      { name: "ชุดปลูกกล้าไม้ระดับมืออาชีพ", qty: 1, price: "฿150.00" },
      { name: "ผักสดจากไร่ ชุดที่ 2", qty: 2, price: "฿130.00" },
      { name: "ค่าจัดส่ง", qty: 1, price: "฿480.00" },
    ],
  },
  {
    id: "#AH-88912",
    date: "20 ก.พ. 2567",
    status: "ได้รับของแล้ว",
    statusColor: "bg-gray-100 text-gray-600",
    dotColor: "bg-gray-400",
    total: "฿2,300.00",
    items: [
      { name: "ปุ๋ยอินทรีย์ (5 กก.)", qty: 1, price: "฿1,250.00" },
      { name: "เมล็ดพันธุ์ผสม", qty: 3, price: "฿255.00" },
      { name: "อุปกรณ์รดน้ำอัตโนมัติ", qty: 1, price: "฿795.00" },
    ],
  },
  {
    id: "#AH-88650",
    date: "02 ก.พ. 2567",
    status: "ได้รับของแล้ว",
    statusColor: "bg-gray-100 text-gray-600",
    dotColor: "bg-gray-400",
    total: "฿540.00",
    items: [{ name: "ผักสดจากไร่ ชุดที่ 2", qty: 4, price: "฿260.00" }],
  },
];

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

export default function Profile() {
  const { itemCount } = useCart();
  const fileInputRef = useRef(null);
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const validTabs = ["info", "orders", "address", "settings"];
  const [activeTab, setActiveTab] = useState(
    validTabs.includes(tabParam) ? tabParam : "info"
  );
  const [toast, setToast] = useState("");

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

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatar(url);
    showToast("อัปเดตรูปโปรไฟล์แล้ว");
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

  const handleSaveProfile = () => {
    if (!validateForm()) return;
    setSavedForm(form);
    showToast("บันทึกการเปลี่ยนแปลงเรียบร้อยแล้ว");
  };

  const isDirty = JSON.stringify(form) !== JSON.stringify(savedForm);

  // ----- Orders -----
  const [orders] = useState(initialOrders);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const visibleOrders = showAllOrders ? orders : orders.slice(0, 3);

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
      showToast("แก้ไขที่อยู่เรียบร้อยแล้ว");
    } else {
      setAddresses((list) => [
        ...list,
        { id: Date.now(), isDefault: list.length === 0, ...addressForm },
      ]);
      showToast("เพิ่มที่อยู่ใหม่เรียบร้อยแล้ว");
    }
    setShowAddressForm(false);
  };

  const handleDeleteAddress = (id) => {
    setAddresses((list) => list.filter((a) => a.id !== id));
    showToast("ลบที่อยู่แล้ว");
  };

  const handleSetDefaultAddress = (id) => {
    setAddresses((list) =>
      list.map((a) => ({ ...a, isDefault: a.id === id }))
    );
    showToast("ตั้งเป็นที่อยู่หลักแล้ว");
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

  const toggleNotif = (key) => {
    setNotif((n) => ({ ...n, [key]: !n[key] }));
  };

  const handleChangePassword = () => {
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
    setPwd({ current: "", next: "", confirm: "" });
    showToast("เปลี่ยนรหัสผ่านเรียบร้อยแล้ว");
  };

  return (
    <div className="min-h-screen w-full bg-white text-gray-900 flex flex-col">
      <Toast message={toast} />

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
          </aside>

          {/* Main content */}
          <div>
            {/* ---------------- ข้อมูลส่วนตัว ---------------- */}
            {activeTab === "info" && (
              <>
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

      {/* Footer */}
      <footer className="bg-green-950 text-white mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-green-700 flex items-center justify-center">
              <Sprout className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm">Farmart</p>
              <p className="text-xs text-white/50">
                © 2024 Farmart. Cultivating trust through transparency.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-white/70 font-medium flex-wrap justify-center">
            <a href="#" className="hover:text-white">Sustainability</a>
            <a href="#" className="hover:text-white">Wholesale</a>
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href="#" className="hover:text-white">Shipping Info</a>
            <a href="#" className="hover:text-white">Contact Us</a>
          </div>
        </div>
      </footer>
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