import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getOrderById, getMyOrders } from "./data/orderStore";
import { fetchCurrentUser, getCachedUser } from "./data/authStore";
import { useCart } from "./CartContext";
import {
  Sprout,
  Search,
  ShoppingCart,
  UserCircle2,
  Home,
  MapPin,
  Clock,
  PackageCheck,
  MessageCircle,
  PackageSearch,
  Loader2,
  ListOrdered,
} from "lucide-react";
import NotificationBell from "./NotificationBell";

// --- Leaflet default marker icons don't ship correctly with bundlers, so we
// build small custom pin icons instead of touching L.Icon.Default.
const pin = (color) =>
  new L.DivIcon({
    className: "",
    html: `<div style="
      width:16px;height:16px;border-radius:9999px;
      background:${color};border:3px solid white;
      box-shadow:0 1px 4px rgba(0,0,0,0.35);
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

const warehouseIcon = pin("#166534"); // green-800
const homeIcon = pin("#111827"); // gray-900
const truckIcon = pin("#16a34a"); // green-600, current courier position

const STEP_LABELS = [
  { key: "confirmed", label: "ยืนยันคำสั่งซื้อ" },
  { key: "packed", label: "เตรียมพัสดุ" },
  { key: "shipping", label: "อยู่ระหว่างจัดส่ง" },
  { key: "arrived", label: "ถึงจุดหมาย" },
  { key: "delivered", label: "จัดส่งสำเร็จ" },
];

// ---------------------------------------------------------------------------
// REAL BACKEND INTEGRATION
// Orders come from GET /api/orders/:id (see data/orderStore.js), which
// returns { id: "ORD-10238", userId, customer, items, total, date, status,
// statusStep, statusLabel, address, paymentMethod }. The backend doesn't
// store map coordinates, so we derive a deterministic (but fake) courier /
// destination position from the order id — that keeps the map useful
// without needing a geocoding service, and the same order always renders
// the same spot instead of jumping around on every refresh.
// ---------------------------------------------------------------------------
const WAREHOUSE = { lat: 13.7367, lng: 100.5231, label: "คลังสินค้า Farmart ลาดพร้าว" };

// Small deterministic string hash -> [0, 1), so the same order id always
// maps to the same "random" offset instead of using Math.random().
function hashToUnit(str, salt) {
  let h = 0;
  const s = `${salt}:${str}`;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return (h % 10000) / 10000;
}

// Spreads fake destinations across the greater Bangkok area.
function buildDestination(order) {
  const lat = 13.68 + hashToUnit(order.id, "lat") * 0.12;
  const lng = 100.45 + hashToUnit(order.id, "lng") * 0.14;
  return {
    lat,
    lng,
    label: order.customer || "ที่อยู่จัดส่ง",
    addressLine: order.address || "ไม่มีข้อมูลที่อยู่",
  };
}

// Places the courier somewhere between the warehouse and the destination,
// proportional to how far along the delivery steps the order is.
function buildCourierPosition(order, destination) {
  const fraction = Math.min(Math.max(order.statusStep ?? 0, 0), 4) / 4;
  return {
    lat: WAREHOUSE.lat + (destination.lat - WAREHOUSE.lat) * fraction,
    lng: WAREHOUSE.lng + (destination.lng - WAREHOUSE.lng) * fraction,
  };
}

function buildEta(order) {
  const day = order.date ? new Date(order.date).toLocaleDateString("th-TH") : "";
  switch (order.statusStep) {
    case 0:
      return "กำลังเตรียมพัสดุ คาดว่าจะจัดส่งใน 1-2 วัน";
    case 1:
      return "เตรียมพัสดุเสร็จแล้ว รอจัดส่งเร็ว ๆ นี้";
    case 2:
      return "อยู่ระหว่างจัดส่ง คาดว่าจะถึงภายในวันนี้";
    case 3:
      return "พัสดุถึงจุดหมายแล้ว รอส่งมอบให้ผู้รับ";
    case 4:
      return `จัดส่งสำเร็จแล้ว${day ? ` เมื่อ ${day}` : ""}`;
    default:
      return "";
  }
}

const ITEM_EMOJI = [
  { keywords: ["แยม", "jam", "marmalade"], emoji: "🍯" },
  { keywords: ["เมล็ด", "seed"], emoji: "🌱" },
  { keywords: ["ปุ๋ย", "fertilizer", "compost"], emoji: "🧴" },
  { keywords: ["กล้าไม้", "seedling", "sapling"], emoji: "🌾" },
  { keywords: ["ผัก", "veget", "organic"], emoji: "🥬" },
];
function emojiFor(name = "") {
  const lower = name.toLowerCase();
  const hit = ITEM_EMOJI.find((e) => e.keywords.some((k) => lower.includes(k)));
  return hit ? hit.emoji : "📦";
}

// Fetches a single order from the real backend and reshapes it into what
// the UI below expects. Throws (so the caller's .catch runs) on 404 / 403 /
// network errors — apiClient already turns those into readable Thai
// messages (e.g. "ไม่พบคำสั่งซื้อ", "ไม่มีสิทธิ์เข้าถึงคำสั่งซื้อนี้").
async function fetchOrder(rawQuery) {
  const key = rawQuery.trim().toUpperCase();
  if (!key) throw new Error("กรุณากรอกหมายเลขคำสั่งซื้อ");

  const order = await getOrderById(key);
  const destination = buildDestination(order);
  const courier = buildCourierPosition(order, destination);

  return {
    id: order.id,
    statusStep: order.statusStep ?? 0,
    statusLabel: order.statusLabel || "ยืนยันคำสั่งซื้อ",
    eta: buildEta(order),
    warehouse: WAREHOUSE,
    courier,
    destination,
    items: (order.items || []).map((i) => ({
      name: i.name,
      qty: i.quantity,
      price: i.price,
      emoji: emojiFor(i.name),
    })),
  };
}

export default function Tracking() {
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("order") || "";

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

  const [query, setQuery] = useState(initialQuery);
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | error
  const [errorMsg, setErrorMsg] = useState("");

  function runSearch(rawQuery) {
    if (!rawQuery.trim()) return;
    setStatus("loading");
    setErrorMsg("");
    fetchOrder(rawQuery)
      .then((result) => {
        setOrder(result);
        setStatus("idle");
        setSearchParams({ order: result.id });
      })
      .catch((err) => {
        setOrder(null);
        setStatus("error");
        setErrorMsg(err?.message || "ไม่พบคำสั่งซื้อนี้ กรุณาตรวจสอบเลขพัสดุอีกครั้ง");
      });
  }

  // If a specific order id was given (typed in, or came from ?order=...),
  // look that up. Otherwise fall back to the customer's own most recent
  // order, so landing on /tracking with no query string still shows
  // something useful instead of a hardcoded demo id that doesn't exist in
  // the real database.
  async function loadLatestOwnOrder() {
    setStatus("loading");
    setErrorMsg("");
    try {
      const orders = await getMyOrders();
      if (!orders || orders.length === 0) {
        setOrder(null);
        setStatus("error");
        setErrorMsg("คุณยังไม่มีคำสั่งซื้อ ลองกรอกหมายเลขคำสั่งซื้อด้านบนแทน");
        return;
      }
      const latest = orders[0];
      setQuery(latest.id);
      runSearch(latest.id);
    } catch (err) {
      setOrder(null);
      setStatus("error");
      setErrorMsg(err?.message || "ไม่สามารถโหลดคำสั่งซื้อได้ กรุณาลองใหม่อีกครั้ง");
    }
  }

  // Load whatever's in the URL (or the customer's latest order) on first render.
  useEffect(() => {
    if (initialQuery) {
      runSearch(initialQuery);
    } else {
      loadLatestOwnOrder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If the user navigates here again with a different ?order= (e.g. from the
  // Orders list page), re-run the lookup for the new id.
  useEffect(() => {
    const paramOrder = searchParams.get("order");
    if (paramOrder && paramOrder !== order?.id) {
      setQuery(paramOrder);
      runSearch(paramOrder);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function handleSubmit(e) {
    e.preventDefault();
    runSearch(query);
  }

  const steps = useMemo(() => {
    if (!order) return [];
    return STEP_LABELS.map((s, idx) => ({
      ...s,
      done: idx <= order.statusStep,
      active: idx === order.statusStep,
    }));
  }, [order]);

  const total = useMemo(
    () => (order ? order.items.reduce((sum, i) => sum + i.price * i.qty, 0) : 0),
    [order]
  );

  return (
    <div className="min-h-screen w-full bg-gray-50 text-gray-900">
      {/* Top nav — shared with Home */}
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
            <Link to="/products" className="hover:text-green-800">สินค้า</Link>
            <Link to="/tracking" className="text-green-800 font-semibold">ติดตามพัสดุ</Link>
            <Link to="/orders" className="hover:text-green-800">คำสั่งซื้อ</Link>
          </nav>

          <div className="flex-1 max-w-xs ml-auto relative hidden sm:block">
           
          </div>

          <div className="flex items-center gap-1">
            <Link
              to="/home"
              title="หน้าแรก"
              className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50"
            >
              <Home className="w-5 h-5" />
            </Link>
            <NotificationBell />
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

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="text-center max-w-lg mx-auto mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">ติดตามพัสดุของคุณ</h1>
          <p className="text-sm text-gray-500">
            ตรวจสอบสถานะการจัดส่งผลผลิตจากเกษตรกรสดใหม่ ส่งตรงถึงหน้าบ้านคุณ
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-lg mx-auto flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="กรอกหมายเลขคำสั่งซื้อ เช่น ORD-10238"
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
            />
          </div>
          <button
            type="submit"
            disabled={status === "loading"}
            className="bg-green-900 hover:bg-green-800 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors shrink-0 flex items-center gap-2"
          >
            {status === "loading" && <Loader2 className="w-4 h-4 animate-spin" />}
            ตรวจสอบสถานะ
          </button>
        </form>

        {/* Link out to the full order history */}
        <div className="max-w-lg mx-auto flex items-center justify-center mb-8">
          <Link
            to="/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 hover:text-green-800 hover:underline"
          >
            <ListOrdered className="w-3.5 h-3.5" />
            ดูคำสั่งซื้อทั้งหมดของฉัน
          </Link>
        </div>

        {status === "loading" && !order && (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mb-3" />
            <p className="text-sm">กำลังค้นหาคำสั่งซื้อ...</p>
          </div>
        )}

        {status === "error" && (
          <div className="max-w-lg mx-auto flex flex-col items-center text-center py-16 bg-white rounded-xl border border-gray-100">
            <PackageSearch className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-sm font-semibold text-gray-800 mb-1">ไม่พบคำสั่งซื้อ</p>
            <p className="text-sm text-gray-500">{errorMsg}</p>
          </div>
        )}

        {order && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column — status + map */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm font-semibold text-gray-900">หมายเลข #{order.id}</p>
                  <span className="text-xs font-semibold bg-green-100 text-green-800 px-2.5 py-1 rounded-full">
                    {order.statusLabel}
                  </span>
                </div>

                <Stepper steps={steps} />

                <div className="mt-6 flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3">
                  <Clock className="w-4 h-4 text-green-700 shrink-0" />
                  <p className="text-sm text-gray-700">{order.eta}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="h-80 w-full">
                  {/* key forces the map to remount when the order changes, so
                      it re-centers instead of keeping the old viewport */}
                  <MapContainer
                    key={order.id}
                    center={[order.courier.lat, order.courier.lng]}
                    zoom={13}
                    scrollWheelZoom={false}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Polyline
                      positions={[
                        [order.warehouse.lat, order.warehouse.lng],
                        [order.courier.lat, order.courier.lng],
                        [order.destination.lat, order.destination.lng],
                      ]}
                      pathOptions={{ color: "#166534", weight: 3, dashArray: "6 6" }}
                    />
                    <Marker position={[order.warehouse.lat, order.warehouse.lng]} icon={warehouseIcon}>
                      <Popup>{order.warehouse.label}</Popup>
                    </Marker>
                    <Marker position={[order.courier.lat, order.courier.lng]} icon={truckIcon}>
                      <Popup>ตำแหน่งพนักงานจัดส่งล่าสุด</Popup>
                    </Marker>
                    <Marker position={[order.destination.lat, order.destination.lng]} icon={homeIcon}>
                      <Popup>{order.destination.label}</Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </div>
            </div>

            {/* Right column — order details */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-sm font-semibold text-gray-900 mb-4">รายละเอียดสินค้า</p>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-lg bg-gray-50 flex items-center justify-center text-xl shrink-0">
                        {item.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 truncate">{item.name}</p>
                        <p className="text-xs text-gray-400">จำนวน {item.qty} ชิ้น</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 shrink-0">
                        ฿{(item.price * item.qty).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 mt-4 pt-4 flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">ยอดรวมคำสั่งซื้อ</p>
                  <p className="text-sm font-bold text-green-800">฿{total.toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-green-700" />
                  <p className="text-sm font-semibold text-gray-900">ที่อยู่จัดส่ง</p>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {order.destination.label}
                  <br />
                  {order.destination.addressLine}
                </p>
              </div>

              <div className="bg-green-950 rounded-xl p-5 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <PackageCheck className="w-4 h-4 text-green-300" />
                  <p className="text-sm font-semibold">พบปัญหาในการจัดส่ง?</p>
                </div>
                <p className="text-xs text-white/60 mb-4 leading-relaxed">
                  หากคุณไม่ได้รับสินค้าตามเวลาที่คาดไว้ ทีมดูแลลูกค้าของเราพร้อมช่วยเหลือ
                </p>
                <button
                  onClick={() => navigate("/help-center")}
                  className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  ติดต่อฝ่ายบริการลูกค้า
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Stepper({ steps }) {
  return (
    <div className="flex items-center">
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1;
        return (
          <div key={step.key} className={`flex items-center ${isLast ? "" : "flex-1"}`}>
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                  ${
                    step.done
                      ? "bg-green-700 text-white"
                      : "bg-gray-100 text-gray-300 border border-gray-200"
                  }
                  ${step.active ? "ring-4 ring-green-100" : ""}
                `}
              >
                {step.done ? "✓" : idx + 1}
              </div>
              <p
                className={`text-[11px] text-center leading-tight w-16 ${
                  step.done ? "text-gray-700 font-medium" : "text-gray-400"
                }`}
              >
                {step.label}
              </p>
            </div>
            {!isLast && (
              <div
                className={`flex-1 h-0.5 mb-5 ${
                  steps[idx + 1].done || step.done ? "bg-green-700" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}