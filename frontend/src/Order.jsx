import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api, API_URL } from "./data/apiClient";
import { fetchCurrentUser, getCachedUser } from "./data/authStore";
import { addNotification } from "./data/notificationStore";
import { useCart } from "./CartContext";
import {
  Sprout,
  Search,
  ShoppingCart,
  UserCircle2,
  ChevronDown,
  ChevronRight,
  PackageSearch,
  Calendar,
  Truck,
  CreditCard,
  XCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import NotificationBell from "./NotificationBell";

// ---------------------------------------------------------------------------
// Status configuration
// ---------------------------------------------------------------------------
// `statusStep` comes from the API as 0-4, matching the same 5 steps used by
// Tracking.jsx's stepper:
//   0 = ยืนยันคำสั่งซื้อ (confirmed)
//   1 = เตรียมพัสดุ (packed)
//   2 = อยู่ระหว่างจัดส่ง (shipping)   <- cutoff: cancelling stops being allowed here
//   3 = ถึงจุดหมาย (arrived)
//   4 = จัดส่งสำเร็จ (delivered)
// We map each step to a standard, easy-to-scan color (gray -> amber -> blue
// -> purple -> green), plus a dedicated red state for locally-cancelled
// orders ("cancelled" isn't a real numeric step from the API — it's a
// client-side override, see `cancelledIds` below).
const SHIPPING_STEP = 2;

const STATUS_STYLES = {
  0: "bg-gray-100 text-gray-600",
  1: "bg-amber-100 text-amber-700",
  2: "bg-blue-100 text-blue-700",
  3: "bg-purple-100 text-purple-700",
  4: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-700",
};

const STATUS_DOT = {
  0: "bg-gray-400",
  1: "bg-amber-500",
  2: "bg-blue-500",
  3: "bg-purple-500",
  4: "bg-green-600",
  cancelled: "bg-red-500",
};

// Real product photos, keyed by keyword (Thai + English) so an item is
// matched to a proper photo just from its name — e.g. "มะม่วงน้ำดอกไม้"
// or "Fresh Mango" both hit the mango photo below. `ORDERS` doesn't carry
// image URLs today, so this is what lets the list show actual photos
// instead of emoji. Add more keyword -> photo pairs any time, or better:
// once your product catalog has real photo URLs, pass them straight
// through as `item.image` and they'll be used automatically (see
// ProductBadge) — that's the long-term correct fix, this map is a
// stand-in until then.
// NOTE: reordered so more specific / higher-priority categories are
// checked first — e.g. a jam name containing "ส้ม" (orange) should still
// match "jam", not "orange", so the jam entry has to come first.
const PRODUCT_PHOTOS = [
  // Farmart's actual catalog: jams/preserves, seeds, fertilizer, seedling
  // kits, and fresh-veg boxes — matched against real order data.
  { keywords: ["แยม", "jam", "marmalade", "ผลไม้แปรรูป"], url: "https://images.unsplash.com/photo-1500912239908-4ee48acb3a7f?auto=format&fit=crop&w=200&q=80" },
  { keywords: ["เมล็ดพันธุ์", "เมล็ด", "seed"], url: "https://images.unsplash.com/photo-1722882270777-7f7ae6468769?auto=format&fit=crop&w=200&q=80" },
  { keywords: ["ปุ๋ย", "fertilizer", "compost"], url: "https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&w=200&q=80" },
  { keywords: ["กล้าไม้", "ปลูกกล้า", "ชุดปลูก", "seedling", "sapling"], url: "https://images.unsplash.com/photo-1667031860219-53ecbc4e18c4?auto=format&fit=crop&w=200&q=80" },
  { keywords: ["ผักสด", "ฝัก", "ผักออร์แกนิก", "vegetable", "veggie", "organic"], url: "https://images.unsplash.com/photo-1648090229186-6188eaefcc6a?auto=format&fit=crop&w=200&q=80" },

  // Common fresh-produce items, kept in case the catalog also sells these directly.
  { keywords: ["มะม่วง", "mango"], url: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=200&q=80" },
  { keywords: ["กล้วย", "banana"], url: "https://images.unsplash.com/photo-1587132137056-bfbf0166836e?auto=format&fit=crop&w=200&q=80" },
  { keywords: ["มะเขือเทศ", "tomato"], url: "https://images.unsplash.com/photo-1587411768515-eeac0647deed?auto=format&fit=crop&w=200&q=80" },
  { keywords: ["ไข่", "egg"], url: "https://images.unsplash.com/photo-1556889473-87a5322d1b9e?auto=format&fit=crop&w=200&q=80" },
  { keywords: ["ส้ม", "orange"], url: "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?auto=format&fit=crop&w=200&q=80" },
  { keywords: ["แครอท", "carrot"], url: "https://images.unsplash.com/photo-1663928958939-2ed7395177a7?auto=format&fit=crop&w=200&q=80" },
  { keywords: ["ผักกาด", "สลัด", "lettuce", "salad"], url: "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&w=200&q=80" },
];

// Soft, produce-themed background tints — used only as a last-resort
// fallback, for a product name that doesn't match any keyword above.
const BADGE_TINTS = [
  "from-green-100 to-emerald-50",
  "from-amber-100 to-orange-50",
  "from-rose-100 to-red-50",
  "from-sky-100 to-blue-50",
  "from-lime-100 to-green-50",
  "from-yellow-100 to-amber-50",
];

function tintFor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return BADGE_TINTS[hash % BADGE_TINTS.length];
}

function photoFor(name) {
  const lower = name.toLowerCase();
  const match = PRODUCT_PHOTOS.find((p) => p.keywords.some((k) => lower.includes(k.toLowerCase())));
  return match?.url ?? null;
}

// order.items[].image from the real API comes in two shapes: an absolute
// URL (http://localhost:4000/uploads/...) or a bare relative path
// (/uploads/products/SD001.svg). The relative form resolves against
// *this* page's own origin if used as-is, which 404s — it needs the
// backend's origin (API_URL) prefixed instead.
function resolveImageUrl(url) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

function ProductBadge({ item, size = "md" }) {
  const dims = size === "lg" ? "w-14 h-14 text-2xl" : "w-11 h-11 text-xl";
  const [broken, setBroken] = useState(false);
  // Prefer a real photo: item.image (from the product catalog) first,
  // then a keyword match against the item name, and only fall back to
  // the plain emoji/tint tile if neither is available or the image
  // fails to actually load (onError below).
  const photo = !broken ? resolveImageUrl(item.image) ?? photoFor(item.name) : null;
  if (photo) {
    return (
      <img
        src={photo}
        alt={item.name}
        onError={() => setBroken(true)}
        className={`${dims} rounded-xl object-cover shrink-0 shadow-sm ring-1 ring-black/5 bg-gray-50`}
      />
    );
  }
  return (
    <div
      className={`${dims} rounded-xl bg-gradient-to-br ${tintFor(
        item.name
      )} flex items-center justify-center shrink-0 shadow-sm ring-1 ring-black/5`}
    >
      {item.emoji ?? "📦"}
    </div>
  );
}

function StatusBadge({ statusKey, label }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full w-fit ${STATUS_STYLES[statusKey]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[statusKey]}`} />
      {label}
    </span>
  );
}

export default function Orders() {
  const { itemCount } = useCart();
  const [openId, setOpenId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // ออเดอร์ที่ยกเลิกแล้ว (client-side override จนกว่าจะรีเฟรชจาก API)
  const [cancelledIds, setCancelledIds] = useState(() => new Set());
  // ออเดอร์ที่กำลังแสดงกล่องยืนยันการยกเลิก
  const [confirmCancelId, setConfirmCancelId] = useState(null);
  // ออเดอร์ที่กำลังส่งคำขอยกเลิกอยู่ (โชว์ spinner + กันกดซ้ำ)
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelError, setCancelError] = useState(null);

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

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await api.get("/api/orders");
        setOrders(data.orders);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  async function handleCancelOrder(orderId) {
    setCancellingId(orderId);
    setCancelError(null);
    try {
      // PATCH matches the convention the other status-changing routes use
      // (/status, /advance) — but this route doesn't exist on the backend
      // yet. See routes/orders.js: only PATCH /:id/status and DELETE /:id
      // exist today, and both require EMPLOYEE/ADMIN. A customer-facing
      // PATCH /api/orders/:id/cancel route needs to be added server-side.
      await api.patch(`/api/orders/${orderId}/cancel`);
      setCancelledIds((prev) => new Set(prev).add(orderId));
      setConfirmCancelId(null);

      // แจ้งเตือนว่ายกเลิกคำสั่งซื้อสำเร็จ -> NotificationBell subscribe
      // อยู่แล้วผ่าน subscribeNotifications จึงอัปเดตวงกลมแดง (unread)
      // ให้ทันทีโดยไม่ต้อง refresh หน้า
      try {
        await addNotification({
          type: "order",
          title: `ยกเลิกคำสั่งซื้อ #${orderId} สำเร็จ`,
          message: "คำสั่งซื้อของคุณถูกยกเลิกเรียบร้อยแล้ว",
        });
      } catch (notifyErr) {
        // ไม่ให้ error ตรงนี้ไปทำให้ flow การยกเลิกดูเหมือนล้มเหลว
        console.error("แจ้งเตือนไม่สำเร็จ:", notifyErr);
      }
    } catch (err) {
      console.error(err);
      setCancelError("ยกเลิกคำสั่งซื้อไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setCancellingId(null);
    }
  }

  // Turn the orders response into a sorted, display-ready array (newest
  // order id first). Order ids are date-based (AGH-YYYYMMDD), so a reverse
  // string sort works fine.
  const orderList = orders
    .map((order) => {
      const total = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
      const itemsSummary = order.items.map((i) => i.name).join(", ");
      const isCancelled = cancelledIds.has(order.id) || order.cancelled === true;

      return {
        ...order,
        total,
        itemCount,
        itemsSummary,
        date: order.date ? new Date(order.date).toLocaleDateString("th-TH") : "-",
        isCancelled,
        // Client-side override once the person cancels — until the order
        // list is refetched, treat it as its own status.
        statusKey: isCancelled ? "cancelled" : order.statusStep,
        statusLabel: isCancelled ? "ยกเลิกแล้ว" : order.statusLabel,
        canCancel: !isCancelled && order.statusStep < SHIPPING_STEP,
      };
    })
    .sort((a, b) => b.id.localeCompare(a.id));

  // กรองตามคำค้นหา — ค้นได้ทั้งเลขคำสั่งซื้อและชื่อสินค้าในออเดอร์
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredOrders = normalizedQuery
    ? orderList.filter(
        (order) =>
          order.id.toLowerCase().includes(normalizedQuery) ||
          order.itemsSummary.toLowerCase().includes(normalizedQuery)
      )
    : orderList;

  return (
    <div className="min-h-screen w-full bg-gray-50 text-gray-900">
      {/* Top nav — shared with Home / Tracking */}
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
            <Link to="/tracking" className="hover:text-green-800">ติดตามพัสดุ</Link>
            <Link to="/orders" className="text-green-800 font-bold">คำสั่งซื้อ</Link>
          </nav>

          <div className="flex-1 max-w-xs ml-auto relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาด้วยเลขคำสั่งซื้อหรือชื่อสินค้า..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
            />
          </div>

          <div className="flex items-center gap-1">
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
        <div className="mb-6 flex items-end justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1.5">คำสั่งซื้อของฉัน</h1>
            <p className="text-sm text-gray-500 max-w-lg">
              ดูประวัติคำสั่งซื้อทั้งหมด กดที่รายการเพื่อดูรายละเอียดสินค้า และยกเลิกคำสั่งซื้อได้หากยังไม่เข้าสู่สถานะกำลังจัดส่ง
            </p>
          </div>
          {orderList.length > 0 && (
            <p className="text-sm text-gray-500 shrink-0">
              {normalizedQuery ? (
                <>
                  พบ <span className="font-semibold text-gray-800">{filteredOrders.length}</span> รายการที่ตรงกับ "{searchQuery.trim()}"
                </>
              ) : (
                <>
                  ทั้งหมด <span className="font-semibold text-gray-800">{orderList.length}</span> คำสั่งซื้อ
                </>
              )}
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Loader2 className="w-6 h-6 text-gray-300 mb-3 animate-spin" />
            <p className="text-sm text-gray-500">กำลังโหลดคำสั่งซื้อ...</p>
          </div>
        ) : orderList.length === 0 ? (
          <div className="flex flex-col items-center text-center py-16 bg-white rounded-2xl border border-gray-100">
            <PackageSearch className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-sm font-semibold text-gray-800 mb-1">ยังไม่มีคำสั่งซื้อ</p>
            <p className="text-sm text-gray-500">เมื่อคุณสั่งซื้อสินค้า รายการจะแสดงที่นี่</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center text-center py-16 bg-white rounded-2xl border border-gray-100">
            <PackageSearch className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-sm font-semibold text-gray-800 mb-1">
              ไม่พบคำสั่งซื้อที่ตรงกับ "{searchQuery.trim()}"
            </p>
            <p className="text-sm text-gray-500">ลองค้นหาด้วยเลขคำสั่งซื้อหรือชื่อสินค้าอื่น</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Table header — hidden on small screens, rows become cards there.
                Column widths must stay identical to the row grid below so
                everything lines up. */}
            <div className="hidden md:grid grid-cols-[1.1fr_2.6fr_0.9fr_1fr_0.9fr_28px] gap-4 px-6 py-3 bg-gray-50/80 border-b border-gray-100 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              <span>คำสั่งซื้อ</span>
              <span>สินค้า</span>
              <span>วันที่สั่งซื้อ</span>
              <span>สถานะ</span>
              <span className="text-right">ยอดรวม</span>
              <span />
            </div>

            <div className="divide-y divide-gray-100">
              {filteredOrders.map((order) => {
                const isOpen = openId === order.id;
                const isConfirming = confirmCancelId === order.id;
                const isCancellingThis = cancellingId === order.id;

                return (
                  <div key={order.id} className={order.isCancelled ? "opacity-70" : ""}>
                    <button
                      type="button"
                      onClick={() => setOpenId(isOpen ? null : order.id)}
                      className="w-full text-left grid grid-cols-1 md:grid-cols-[1.1fr_2.6fr_0.9fr_1fr_0.9fr_28px] gap-3 md:gap-4 items-center px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      {/* Order id + date (mobile) */}
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">#{order.id}</p>
                        {order.date && (
                          <p className="md:hidden text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3" /> {order.date}
                          </p>
                        )}
                      </div>

                      {/* Product photo strip */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex -space-x-3 shrink-0">
                          {order.items.slice(0, 4).map((item, idx) => (
                            <ProductBadge key={idx} item={item} />
                          ))}
                          {order.items.length > 4 && (
                            <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-500 ring-1 ring-black/5 shrink-0">
                              +{order.items.length - 4}
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate hidden lg:block">
                          {order.itemsSummary}
                        </p>
                      </div>

                      {/* Date (desktop) */}
                      <p className="hidden md:flex items-center gap-1.5 text-sm text-gray-500">
                        <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        {order.date ?? "—"}
                      </p>

                      {/* Status */}
                      <div>
                        <StatusBadge statusKey={order.statusKey} label={order.statusLabel} />
                      </div>

                      {/* Total */}
                      <div className="text-left md:text-right">
                        <p className="text-base font-bold text-green-800">฿{order.total.toLocaleString()}</p>
                        <p className="text-[11px] text-gray-400">{order.itemCount} ชิ้น</p>
                      </div>

                      <ChevronDown
                        className={`w-4 h-4 text-gray-300 shrink-0 justify-self-end transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Expanded detail panel */}
                    {isOpen && (
                      <div className="px-6 pb-6 bg-gray-50/60 border-t border-gray-100">
                        <div className="pt-5 grid gap-5 lg:grid-cols-[2fr_1fr]">
                          {/* Item list with bigger photos */}
                          <div className="space-y-3">
                            {order.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-4 bg-white rounded-xl border border-gray-100 px-4 py-3"
                              >
                                <ProductBadge item={item} size="lg" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                                  <p className="text-xs text-gray-500">
                                    ฿{item.price.toLocaleString()} × {item.quantity}
                                  </p>
                                </div>
                                <p className="text-sm font-bold text-gray-800 shrink-0">
                                  ฿{(item.price * item.quantity).toLocaleString()}
                                </p>
                              </div>
                            ))}
                          </div>

                          {/* Summary sidebar */}
                          <div className="bg-white rounded-xl border border-gray-100 p-4 h-fit space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500 flex items-center gap-1.5">
                                <CreditCard className="w-3.5 h-3.5" /> ยอดรวมสินค้า
                              </span>
                              <span className="font-semibold text-gray-800">฿{order.total.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500 flex items-center gap-1.5">
                                <Truck className="w-3.5 h-3.5" /> ค่าจัดส่ง
                              </span>
                              <span className="font-semibold text-gray-800">ฟรี</span>
                            </div>
                            <div className="h-px bg-gray-100" />
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-semibold text-gray-700">ยอดชำระทั้งหมด</span>
                              <span className="font-bold text-green-800">฿{order.total.toLocaleString()}</span>
                            </div>

                            {!order.isCancelled && (
                              <Link
                                to={`/tracking?order=${order.id}`}
                                className="mt-1 w-full flex items-center justify-center gap-1.5 text-sm font-semibold text-white bg-green-800 hover:bg-green-900 rounded-lg py-2.5 transition-colors"
                              >
                                ติดตามพัสดุ <ChevronRight className="w-4 h-4" />
                              </Link>
                            )}

                            {/* --- Cancel order --- */}
                            {order.isCancelled ? (
                              <p className="flex items-center gap-1.5 text-xs font-medium text-red-600 pt-1">
                                <XCircle className="w-3.5 h-3.5" /> คำสั่งซื้อนี้ถูกยกเลิกแล้ว
                              </p>
                            ) : order.canCancel ? (
                              isConfirming ? (
                                <div className="pt-1 space-y-2">
                                  <p className="flex items-start gap-1.5 text-xs text-gray-500">
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                    ยืนยันยกเลิกคำสั่งซื้อ #{order.id}? การกระทำนี้ไม่สามารถย้อนกลับได้
                                  </p>
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      disabled={isCancellingThis}
                                      onClick={() => handleCancelOrder(order.id)}
                                      className="flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg py-2 transition-colors"
                                    >
                                      {isCancellingThis && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                      {isCancellingThis ? "กำลังยกเลิก..." : "ยืนยันยกเลิก"}
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isCancellingThis}
                                      onClick={() => setConfirmCancelId(null)}
                                      className="flex-1 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-60 rounded-lg py-2 transition-colors"
                                    >
                                      ไม่ยกเลิก
                                    </button>
                                  </div>
                                  {cancelError && (
                                    <p className="text-xs text-red-600">{cancelError}</p>
                                  )}
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCancelError(null);
                                    setConfirmCancelId(order.id);
                                  }}
                                  className="mt-1 w-full flex items-center justify-center gap-1.5 text-sm font-semibold text-red-600 bg-white border border-red-200 hover:bg-red-50 rounded-lg py-2.5 transition-colors"
                                >
                                  <XCircle className="w-4 h-4" /> ยกเลิกคำสั่งซื้อ
                                </button>
                              )
                            ) : (
                              <p className="text-[11px] text-gray-400 pt-1">
                                คำสั่งซื้อนี้อยู่ระหว่างจัดส่งแล้ว จึงไม่สามารถยกเลิกได้
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}