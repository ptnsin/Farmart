import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Sprout,
  Search,
  ShoppingCart,
  Bell,
  UserCircle2,
  MapPin,
  Clock,
  PackageCheck,
  MessageCircle,
  PackageSearch,
  Loader2,
  ListOrdered,
} from "lucide-react";

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
// MOCK ORDER DATABASE
// Swap this whole block for a real API call — see fetchOrder() below.
// Every field the UI reads comes from here, so wiring a backend later just
// means replacing ORDERS[key] lookups with the response from your endpoint.
// Exported so the Orders list page (Orders.jsx) can reuse the same data
// instead of duplicating it.
// ---------------------------------------------------------------------------
export const ORDERS = {
  "AGH-20260701": {
    statusStep: 2, // index into STEP_LABELS, 0-based
    statusLabel: "กำลังจัดส่ง",
    eta: "วันนี้ เวลา 14:00 - 16:00 น.",
    warehouse: { lat: 13.7367, lng: 100.5231, label: "คลังสินค้า Farmart ลาดพร้าว" },
    courier: { lat: 13.748, lng: 100.507 },
    destination: {
      lat: 13.7563,
      lng: 100.4913,
      label: "บ้านเลขที่ 123/45 หมู่บ้านพฤกษาเจริญ",
      addressLine: "เขตดุสิต กรุงเทพมหานคร 10300",
    },
    items: [
      { name: "แยมเปลือกส้มเกรดเอ (4 ขวด)", qty: 2, price: 240, emoji: "🍯" },
      { name: "ผักออร์แกนิกรวมสุดคุ้ม", qty: 1, price: 55, emoji: "🥬" },
    ],
  },
  "AGH-20260630": {
    statusStep: 1,
    statusLabel: "เตรียมพัสดุ",
    eta: "พรุ่งนี้ เวลา 09:00 - 12:00 น.",
    warehouse: { lat: 13.7367, lng: 100.5231, label: "คลังสินค้า Farmart ลาดพร้าว" },
    courier: { lat: 13.7367, lng: 100.5231 },
    destination: {
      lat: 13.7245,
      lng: 100.5352,
      label: "คอนโด กรีนวิว สุขุมวิท 71",
      addressLine: "เขตวัฒนา กรุงเทพมหานคร 10110",
    },
    items: [
      { name: "เมล็ดพันธุ์ผสม", qty: 1, price: 85, emoji: "🌾" },
      { name: "ปุ๋ยอินทรีย์ (5 กก.)", qty: 1, price: 1250, emoji: "🧴" },
    ],
  },
  "AGH-20260625": {
    statusStep: 4,
    statusLabel: "จัดส่งสำเร็จ",
    eta: "จัดส่งสำเร็จเมื่อ 25 มิ.ย. 2569 เวลา 11:20 น.",
    warehouse: { lat: 13.7367, lng: 100.5231, label: "คลังสินค้า Farmart ลาดพร้าว" },
    courier: { lat: 13.7008, lng: 100.5325 },
    destination: {
      lat: 13.7008,
      lng: 100.5325,
      label: "บ้านเลขที่ 88 ซอยอ่อนนุช 30",
      addressLine: "เขตสวนหลวง กรุงเทพมหานคร 10250",
    },
    items: [
      { name: "ผักสดจากไร่ ชุดที่ 2", qty: 3, price: 65, emoji: "🫑" },
    ],
  },
  "AGH-20260610": {
    statusStep: 0,
    statusLabel: "ยืนยันคำสั่งซื้อ",
    eta: "กำลังเตรียมพัสดุ คาดว่าจะจัดส่งใน 1-2 วัน",
    warehouse: { lat: 13.7367, lng: 100.5231, label: "คลังสินค้า Farmart ลาดพร้าว" },
    courier: { lat: 13.7367, lng: 100.5231 },
    destination: {
      lat: 13.79,
      lng: 100.5548,
      label: "บ้านเลขที่ 9 ถนนวิภาวดีรังสิต",
      addressLine: "เขตจตุจักร กรุงเทพมหานคร 10900",
    },
    items: [
      { name: "ชุดปลูกกล้าไม้ระดับมืออาชีพ", qty: 1, price: 150, emoji: "🌱" },
    ],
  },
};

// Simulated network call — replace the body with a real `fetch()` to your
// tracking API. Keeping the same shape (resolve order | reject Error) means
// nothing else in this file has to change.
function fetchOrder(rawQuery) {
  const key = rawQuery.trim().toUpperCase();
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const order = ORDERS[key];
      if (order) resolve({ id: key, ...order });
      else reject(new Error("NOT_FOUND"));
    }, 500); // small delay so the loading state is visible/testable
  });
}

export default function Tracking() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("order") || "AGH-20260701";

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
      .catch(() => {
        setOrder(null);
        setStatus("error");
        setErrorMsg("ไม่พบคำสั่งซื้อนี้ กรุณาตรวจสอบเลขพัสดุอีกครั้ง");
      });
  }

  // Load whatever's in the URL (or the default) on first render.
  useEffect(() => {
    runSearch(initialQuery);
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
              className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50"
            >
              <ShoppingCart className="w-5 h-5" />
            </Link>
            <Link
              to="/profile"
              className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50"
            >
              <UserCircle2 className="w-6 h-6" />
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
              placeholder="กรอกหมายเลขคำสั่งซื้อ เช่น AGH-20260701"
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
                <button className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
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