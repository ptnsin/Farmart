import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sprout,
  Search,
  Heart,
  ShoppingCart,
  UserCircle2,
  LayoutGrid,
  MapPin,
  Plus,
  Truck,
  Zap,
  QrCode,
  CreditCard,
  Landmark,
  PackageCheck,
  UploadCloud,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
} from "lucide-react";
import { useCart } from "./CartContext";
import { createOrder, toOrderItems } from "./data/orderStore";
import { fetchCurrentUser, getCachedUser } from "./data/authStore";

const SHIPPING_METHODS = [
  {
    key: "standard",
    label: "Standard Delivery (จัดส่งมาตรฐาน)",
    eta: "ได้รับภายใน 3-5 วันทำการ",
    fee: 45,
    icon: Truck,
  },
  {
    key: "express",
    label: "Express Delivery (จัดส่งด่วน)",
    eta: "ได้รับภายใน 1-2 วันทำการ",
    fee: 85,
    icon: Zap,
  },
];

const PAYMENT_METHODS = [
  { key: "promptpay", label: "พร้อมเพย์ (PromptPay)", icon: QrCode },
  { key: "card", label: "บัตรเครดิต / เดบิต", icon: CreditCard },
  { key: "bank", label: "โอนเงินผ่านธนาคาร", icon: Landmark },
  { key: "cod", label: "เก็บเงินปลายทาง", icon: PackageCheck },
];

const INITIAL_ADDRESSES = [
  {
    id: 1,
    label: "บ้าน",
    isDefault: true,
    name: "สมชาย รักษาดี",
    detail: "123/45 หมู่บ้านสีเขียว ซอย 12 ถนนเกษตร-นวมินทร์",
    sub: "แขวงลาดพร้าว เขตลาดพร้าว กรุงเทพฯ 10230",
    phone: "081-234-5678",
  },
  {
    id: 2,
    label: "ที่ทำงาน",
    isDefault: false,
    name: "สมชาย รักษาดี",
    detail: "อาคารเกษตรทาวเวอร์ ชั้น 12 เลขที่ 1205",
    sub: "ถนนวิภาวดีรังสิต เขตจตุจักร กรุงเทพฯ 10900",
    phone: "02-123-4567",
  },
];

function NewAddressForm({ onCancel, onSave }) {
  const [form, setForm] = useState({
    label: "",
    name: "",
    phone: "",
    detail: "",
    sub: "",
  });

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const canSave = form.name && form.phone && form.detail;

  return (
    <div className="border border-green-200 bg-green-50/50 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-900">เพิ่มที่อยู่ใหม่</p>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          placeholder="ชื่อป้ายกำกับ (เช่น บ้าน, ที่ทำงาน)"
          value={form.label}
          onChange={update("label")}
          className="text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700"
        />
        <input
          placeholder="ชื่อผู้รับ"
          value={form.name}
          onChange={update("name")}
          className="text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700"
        />
        <input
          placeholder="เบอร์โทรศัพท์"
          value={form.phone}
          onChange={update("phone")}
          className="text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700 sm:col-span-2"
        />
        <input
          placeholder="ที่อยู่ (บ้านเลขที่ ถนน ซอย)"
          value={form.detail}
          onChange={update("detail")}
          className="text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700 sm:col-span-2"
        />
        <input
          placeholder="แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์"
          value={form.sub}
          onChange={update("sub")}
          className="text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700 sm:col-span-2"
        />
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button
          onClick={onCancel}
          className="text-sm font-medium text-gray-500 px-4 py-2 rounded-lg hover:bg-white"
        >
          ยกเลิก
        </button>
        <button
          disabled={!canSave}
          onClick={() => onSave(form)}
          className="text-sm font-semibold text-white bg-green-800 hover:bg-green-900 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 rounded-lg"
        >
          บันทึกที่อยู่
        </button>
      </div>
    </div>
  );
}

export default function Checkout() {
  const { items, itemCount, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  // รูปโปรไฟล์ผู้ใช้ปัจจุบัน (แสดงที่ไอคอนมุมขวาบน)
  const [avatar, setAvatar] = useState(null);
  useEffect(() => {
    const cached = getCachedUser();
    if (cached?.avatar) setAvatar(cached.avatar);
    fetchCurrentUser()
      .then((user) => {
        if (user?.avatar) setAvatar(user.avatar);
      })
      .catch(() => {});
  }, []);

  const [addresses, setAddresses] = useState(INITIAL_ADDRESSES);
  const [selectedAddress, setSelectedAddress] = useState(
    INITIAL_ADDRESSES.find((a) => a.isDefault)?.id ?? INITIAL_ADDRESSES[0]?.id
  );
  const [addingAddress, setAddingAddress] = useState(false);

  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("promptpay");

  const [slipFile, setSlipFile] = useState(null);
  const fileInputRef = useRef(null);

  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState("");

  const shippingFee =
    SHIPPING_METHODS.find((m) => m.key === shippingMethod)?.fee ?? 0;
  const discount = 0;
  const total = useMemo(
    () => subtotal + shippingFee - discount,
    [subtotal, shippingFee, discount]
  );

  const handleAddAddress = (form) => {
    const newAddr = {
      id: Date.now(),
      label: form.label || "ที่อยู่ใหม่",
      isDefault: false,
      name: form.name,
      detail: form.detail,
      sub: form.sub,
      phone: form.phone,
    };
    setAddresses((prev) => [...prev, newAddr]);
    setSelectedAddress(newAddr.id);
    setAddingAddress(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setSlipFile(file);
  };

  const needsSlip = paymentMethod === "bank" || paymentMethod === "promptpay";

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    setPlacing(true);
    setOrderError("");

    const addr = addresses.find((a) => a.id === selectedAddress);
    const addressText = addr
      ? `${addr.name} (${addr.phone}) ${addr.detail} ${addr.sub}`.trim()
      : "";

    try {
      await createOrder({
        items: toOrderItems(items),
        address: addressText,
        paymentMethod,
      });
      clearCart();
      navigate("/orders");
    } catch (err) {
      setOrderError(err.message || "สั่งซื้อไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 text-gray-900">
      {/* Top nav */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto flex items-center gap-6 px-6 py-3.5">
          <Link to="/home" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-md bg-green-800 flex items-center justify-center">
              <Sprout className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">Farmart</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600 font-medium">
            <Link to="/home" className="hover:text-green-800">แนะนำ</Link>
            <Link to="/products" className="hover:text-green-800">ผลิตภัณฑ์</Link>
            <Link to="/orders" className="hover:text-green-800">คำสั่งซื้อ</Link>
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
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50">
              <Heart className="w-5 h-5" />
            </button>
            <Link
              to="/cart"
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
              className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50 overflow-hidden"
            >
              {avatar ? (
                <img src={avatar} alt="โปรไฟล์" className="w-full h-full object-cover" />
              ) : (
                <UserCircle2 className="w-6 h-6" />
              )}
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-xl font-bold text-gray-900 mb-6">ดำเนินการชำระเงิน</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Address */}
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900">
                  <MapPin className="w-4 h-4 text-green-700" />
                  ที่อยู่จัดส่ง
                </h2>
                {!addingAddress && (
                  <button
                    onClick={() => setAddingAddress(true)}
                    className="flex items-center gap-1 text-xs font-semibold text-green-700 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    เพิ่มที่อยู่ใหม่
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addresses.map((addr) => {
                  const active = selectedAddress === addr.id;
                  return (
                    <button
                      key={addr.id}
                      onClick={() => setSelectedAddress(addr.id)}
                      className={`text-left border rounded-xl p-4 transition-colors relative ${
                        active
                          ? "border-green-600 bg-green-50/60"
                          : "border-gray-200 hover:border-green-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            active
                              ? "bg-green-700 text-white"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {addr.label}
                        </span>
                        {active && (
                          <span className="w-5 h-5 rounded-full bg-green-700 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {addr.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        {addr.detail}
                        <br />
                        {addr.sub}
                      </p>
                      <p className="text-xs text-gray-400 mt-1.5">{addr.phone}</p>
                    </button>
                  );
                })}
              </div>

              {addingAddress && (
                <div className="mt-4">
                  <NewAddressForm
                    onCancel={() => setAddingAddress(false)}
                    onSave={handleAddAddress}
                  />
                </div>
              )}
            </div>

            {/* Shipping method */}
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-4">
                <Truck className="w-4 h-4 text-green-700" />
                วิธีการจัดส่ง
              </h2>
              <div className="space-y-3">
                {SHIPPING_METHODS.map((m) => {
                  const Icon = m.icon;
                  const active = shippingMethod === m.key;
                  return (
                    <button
                      key={m.key}
                      onClick={() => setShippingMethod(m.key)}
                      className={`w-full flex items-center gap-3 border rounded-xl p-4 text-left transition-colors ${
                        active
                          ? "border-green-600 bg-green-50/60"
                          : "border-gray-200 hover:border-green-200"
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          active ? "border-green-700" : "border-gray-300"
                        }`}
                      >
                        {active && (
                          <span className="w-2.5 h-2.5 rounded-full bg-green-700" />
                        )}
                      </span>
                      <Icon className="w-4 h-4 text-gray-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800">
                          {m.label}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{m.eta}</p>
                      </div>
                      <p className="text-sm font-bold text-gray-900 shrink-0">
                        ฿{m.fee.toLocaleString()}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payment method */}
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-4">
                <CreditCard className="w-4 h-4 text-green-700" />
                ช่องทางการชำระเงิน
              </h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map((m) => {
                  const Icon = m.icon;
                  const active = paymentMethod === m.key;
                  return (
                    <div key={m.key}>
                      <button
                        onClick={() => setPaymentMethod(m.key)}
                        className={`w-full flex items-center gap-3 border rounded-xl p-4 text-left transition-colors ${
                          active
                            ? "border-green-600 bg-green-50/60"
                            : "border-gray-200 hover:border-green-200"
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            active ? "border-green-700" : "border-gray-300"
                          }`}
                        >
                          {active && (
                            <span className="w-2.5 h-2.5 rounded-full bg-green-700" />
                          )}
                        </span>
                        <Icon className="w-4 h-4 text-gray-500 shrink-0" />
                        <p className="text-sm font-semibold text-gray-800 flex-1">
                          {m.label}
                        </p>
                      </button>

                      {active && m.key === "promptpay" && (
                        <div className="mt-2 ml-8 border border-dashed border-green-200 rounded-xl p-4 flex items-center gap-4 bg-green-50/40">
                          <div className="w-20 h-20 bg-white border border-gray-200 rounded-lg flex items-center justify-center shrink-0">
                            <QrCode className="w-12 h-12 text-gray-700" />
                          </div>
                          <div className="text-xs text-gray-600 leading-relaxed">
                            <p>
                              สแกน QR Code เพื่อชำระเงินผ่านแอปธนาคารของคุณ
                              หรือแอปพร้อมเพย์
                            </p>
                            <p className="mt-1.5 font-bold text-gray-900 text-sm">
                              ยอดชำระ: ฿{total.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right column: order summary */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white border border-gray-100 rounded-xl p-5 sticky top-20">
              <h2 className="text-sm font-bold text-gray-900 mb-4">สรุปคำสั่งซื้อ</h2>

              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {items.length === 0 ? (
                  <p className="text-xs text-gray-400">ไม่มีสินค้าในตะกร้า</p>
                ) : (
                  items.map((item) => (
                    <div key={item.key} className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-lg bg-gray-50 overflow-hidden shrink-0 flex items-center justify-center text-lg">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          item.emoji || "🌱"
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          จำนวน {item.quantity} ชิ้น
                        </p>
                      </div>
                      <p className="text-xs font-bold text-gray-900 shrink-0">
                        ฿{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-gray-100 my-4" />

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>ยอดรวมสินค้า (Subtotal)</span>
                  <span className="font-medium text-gray-900">
                    ฿{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>ค่าจัดส่ง (Shipping)</span>
                  <span className="font-medium text-gray-900">
                    ฿{shippingFee.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>ส่วนลด (Discount)</span>
                  <span className="font-medium text-gray-900">
                    -฿{discount.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 my-4" />

              <div className="flex justify-between items-baseline mb-5">
                <span className="text-sm font-bold text-gray-900">ยอดรวมสุทธิ</span>
                <span className="text-lg font-bold text-green-800">
                  ฿{total.toLocaleString()}
                </span>
              </div>

              {orderError && (
                <div className="flex items-start gap-2 mb-3 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
                  <X className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{orderError}</span>
                </div>
              )}

              <button
                disabled={items.length === 0 || placing}
                onClick={handlePlaceOrder}
                className="w-full flex items-center justify-center gap-2 bg-green-800 hover:bg-green-900 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold py-3 rounded-lg transition-colors"
              >
                {placing ? "กำลังดำเนินการ..." : "สั่งซื้อสินค้า"}
                {!placing && <ArrowRight className="w-4 h-4" />}
              </button>

              <div className="flex items-start gap-2 mt-4 text-xs text-gray-400">
                <ShieldCheck className="w-4 h-4 text-green-700 mt-0.5 shrink-0" />
                <span>ข้อมูลการชำระเงินของคุณปลอดภัยและได้รับการเข้ารหัส</span>
              </div>
            </div>

            {/* Slip upload */}
            {needsSlip && (
              <div className="bg-white border border-gray-100 rounded-xl p-5">
                <p className="text-sm font-bold text-gray-900 mb-1">
                  สลิปหลักฐานการโอนเงิน (Slip)
                </p>
                <p className="text-xs text-gray-400 mb-3">
                  รองรับไฟล์ JPG, PNG ขนาดไม่เกิน 5MB
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg"
                  className="hidden"
                  onChange={handleFileChange}
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-200 hover:border-green-300 rounded-xl py-6 flex flex-col items-center gap-2 text-gray-400 transition-colors"
                >
                  <UploadCloud className="w-6 h-6" />
                  <span className="text-xs">
                    {slipFile ? "เปลี่ยนไฟล์" : "ลากไฟล์มาวาง หรือคลิกเพื่อเลือกไฟล์"}
                  </span>
                </button>

                {slipFile && (
                  <div className="flex items-center gap-2 mt-3 text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{slipFile.name}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-green-950 mt-12">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md bg-green-700 flex items-center justify-center">
                <Sprout className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-white text-sm">Farmart</span>
            </div>
            <p className="text-xs text-white/50">
              © 2024 Farmart. Cultivated trust through transparency.
            </p>
          </div>
          <div className="flex items-center gap-6 text-xs text-white/70">
            <a href="#" className="hover:text-white">Sustainability</a>
            <a href="#" className="hover:text-white">Wholesale</a>
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Shipping Info</a>
          </div>
        </div>
      </footer>
    </div>
  );
}