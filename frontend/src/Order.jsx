import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Sprout,
  Search,
  Truck,
  Heart,
  ShoppingCart,
  UserCircle2,
  User,
  Package,
  MapPin,
  Settings,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from "lucide-react";
import { useCart } from "./CartContext";

const PAGE_SIZE = 5;

const STATUS_MAP = {
  delivered: { label: "จัดส่งแล้ว", tone: "bg-green-100 text-green-700" },
  shipping: { label: "อยู่ระหว่างจัดส่ง", tone: "bg-orange-100 text-orange-700" },
  processing: { label: "กำลังเตรียมสินค้า", tone: "bg-blue-100 text-blue-700" },
  cancelled: { label: "ยกเลิก", tone: "bg-red-100 text-red-700" },
};

const ORDERS = [
  {
    id: "ORD-88291",
    status: "delivered",
    date: "24 ก.ค. 2024",
    total: 1250,
    items: [
      {
        name: "เมล็ดพันธุ์ผักสลัดออร์แกนิก",
        qty: 2,
        price: 250,
        image:
          "https://images.unsplash.com/photo-1508747703725-719777637510?q=80&w=200&auto=format&fit=crop",
      },
      {
        name: "ผักสลัดครบชุด (กล่องรวม)",
        qty: 1,
        price: 750,
        image:
          "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=200&auto=format&fit=crop",
      },
    ],
  },
  {
    id: "ORD-87102",
    status: "shipping",
    date: "18 ก.ค. 2024",
    total: 450,
    items: [
      {
        name: "ข้าวหอมมะลิแท้ 100% สุรินทร์ (5กก.)",
        qty: 1,
        price: 450,
        image:
          "https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=200&auto=format&fit=crop",
      },
    ],
  },
  {
    id: "ORD-86554",
    status: "cancelled",
    date: "02 ก.ค. 2024",
    total: 890,
    items: [
      {
        name: "ชุดผักสวนครัว และปุ๋ยชีวภาพ",
        qty: 1,
        price: 890,
        image:
          "https://images.unsplash.com/photo-1590779033100-9f60a05a013d?q=80&w=200&auto=format&fit=crop",
      },
    ],
  },
  {
    id: "ORD-85310",
    status: "processing",
    date: "27 มิ.ย. 2024",
    total: 1620,
    items: [
      {
        name: "ปุ๋ยชีวภาพ สูตรพรีเมียม HarvestGold",
        qty: 2,
        price: 245,
        image:
          "https://images.unsplash.com/photo-1620200423727-8127f75d7f53?q=80&w=200&auto=format&fit=crop",
      },
      {
        name: "ชุดปลูกกล้าไม้ระดับมืออาชีพ",
        qty: 1,
        price: 1130,
        image:
          "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=200&auto=format&fit=crop",
      },
    ],
  },
  {
    id: "ORD-84077",
    status: "delivered",
    date: "11 มิ.ย. 2024",
    total: 320,
    items: [
      {
        name: "ผักสดจากไร่ ชุดที่ 2",
        qty: 4,
        price: 80,
        image:
          "https://images.unsplash.com/photo-1567306301408-9b74779a11af?q=80&w=200&auto=format&fit=crop",
      },
    ],
  },
  {
    id: "ORD-83912",
    status: "delivered",
    date: "29 พ.ค. 2024",
    total: 2100,
    items: [
      {
        name: "เครื่องมือเกษตรชุดพื้นฐาน",
        qty: 1,
        price: 2100,
        image:
          "https://images.unsplash.com/photo-1585513553738-84e18e6dd7bd?q=80&w=200&auto=format&fit=crop",
      },
    ],
  },
];

const FILTERS = [
  { key: "all", label: "ทั้งหมด" },
  { key: "delivered", label: "จัดส่งแล้ว" },
  { key: "shipping", label: "อยู่ระหว่างจัดส่ง" },
  { key: "processing", label: "กำลังเตรียมสินค้า" },
  { key: "cancelled", label: "ยกเลิก" },
];

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.processing;
  return (
    <span
      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${s.tone}`}
    >
      {s.label}
    </span>
  );
}

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);
  const cover = order.items[0]?.image;
  const extraCount = order.items.length - 1;

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="w-16 h-16 rounded-lg bg-gray-50 overflow-hidden shrink-0">
          <img src={cover} alt="" className="w-full h-full object-cover" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs font-semibold text-gray-400">
              #{order.id}
            </span>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-1">
            {order.items[0]?.name}
            {extraCount > 0 && (
              <span className="text-gray-400 font-normal"> +{extraCount} รายการ</span>
            )}
          </p>
          <p className="text-xs text-gray-400 mt-1">สั่งซื้อเมื่อ {order.date}</p>
        </div>

        <div className="flex sm:flex-col sm:items-end items-center justify-between gap-1 sm:gap-1.5 sm:text-right">
          <p className="text-[11px] text-gray-400">ยอดรวมคำสั่งซื้อ</p>
          <p className="text-base font-bold text-gray-900">
            ฿{order.total.toLocaleString()}
          </p>
        </div>

        <button
          onClick={() => setExpanded((e) => !e)}
          className="flex items-center justify-center gap-1.5 shrink-0 text-sm font-semibold text-green-700 border border-green-200 hover:bg-green-50 px-4 py-2 rounded-lg transition-colors"
        >
          ดูรายละเอียด
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50/60 px-4 sm:px-5 py-4 space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-white overflow-hidden shrink-0 border border-gray-100">
                <img src={item.image} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 line-clamp-1">{item.name}</p>
                <p className="text-xs text-gray-400">
                  {item.qty} x ฿{item.price.toLocaleString()}
                </p>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                ฿{(item.qty * item.price).toLocaleString()}
              </p>
            </div>
          ))}
          {order.status !== "cancelled" && (
            <div className="pt-2">
              <Link
                to="/tracking"
                className="text-xs font-semibold text-green-700 hover:underline"
              >
                ติดตามสถานะการจัดส่ง →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Order() {
  const { itemCount } = useCart();
  const [statusFilter, setStatusFilter] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return ORDERS;
    return ORDERS.filter((o) => o.status === statusFilter);
  }, [statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const sidebarLinks = [
    { icon: User, label: "ข้อมูลส่วนตัว", to: "/profile" },
    { icon: Package, label: "คำสั่งซื้อของฉัน", to: "/orders", active: true },
    { icon: MapPin, label: "ที่อยู่จัดส่ง", to: "#" },
    { icon: Settings, label: "ตั้งค่าบัญชี", to: "#" },
  ];

  return (
    <div className="min-h-screen w-full bg-white text-gray-900">
      {/* Top nav */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto flex items-center gap-6 px-6 py-3.5">
          <Link to="/home" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-md bg-green-800 flex items-center justify-center">
              <Sprout className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">AgriHarvest</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600 font-medium">
            <Link to="/products" className="hover:text-green-800">เลือกสินค้า</Link>
            <Link to="/orders" className="text-green-800 font-semibold">คำสั่งซื้อ</Link>
            <a href="#" className="hover:text-green-800">อุปกรณ์ครบชุด</a>
          </nav>

          <div className="flex-1 max-w-xs ml-auto relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาคำสั่งซื้อ..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
            />
          </div>

          <div className="flex items-center gap-1">
            <Link
              to="/tracking"
              title="ติดตามพัสดุ"
              className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50"
            >
              <Truck className="w-5 h-5" />
            </Link>
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
              className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50"
            >
              <UserCircle2 className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row gap-8">
        {/* Account sidebar */}
        <aside className="w-full md:w-60 shrink-0">
          <div className="mb-6">
            <p className="text-base font-bold text-gray-900">Welcome back</p>
            <p className="text-xs text-gray-400 mt-0.5">Manage your harvest</p>
          </div>
          <nav className="space-y-1">
            {sidebarLinks.map((l) => {
              const Icon = l.icon;
              return (
                <Link
                  key={l.label}
                  to={l.to}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    l.active
                      ? "bg-green-800 text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Orders */}
        <section className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1 gap-4 flex-wrap">
            <div>
              <h1 className="text-lg font-bold text-gray-900">คำสั่งซื้อของฉัน</h1>
              <p className="text-sm text-gray-500 mt-1">
                ตรวจสอบและติดตามความคืบหน้าคำสั่งซื้อที่คุณสั่งซื้อ
              </p>
            </div>

            <div className="relative">
              <button
                onClick={() => setFilterOpen((o) => !o)}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg px-3.5 py-2 hover:border-green-300"
              >
                <Filter className="w-4 h-4" />
                กรองรายการ
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {filterOpen && (
                <div className="absolute right-0 mt-1.5 w-48 bg-white border border-gray-100 rounded-lg shadow-lg py-1.5 z-10">
                  {FILTERS.map((f) => (
                    <button
                      key={f.key}
                      onClick={() => {
                        setStatusFilter(f.key);
                        setFilterOpen(false);
                        setPage(1);
                      }}
                      className={`w-full text-left text-sm px-3.5 py-2 hover:bg-gray-50 ${
                        statusFilter === f.key
                          ? "text-green-700 font-semibold"
                          : "text-gray-600"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 mt-6">
            {pageItems.length === 0 ? (
              <div className="border border-dashed border-gray-200 rounded-xl py-16 text-center text-gray-400 text-sm">
                ไม่พบคำสั่งซื้อตามเงื่อนไขที่เลือก
              </div>
            ) : (
              pageItems.map((order) => <OrderCard key={order.id} order={order} />)
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    n === currentPage
                      ? "bg-green-900 text-white"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-10">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-green-800 flex items-center justify-center">
              <Sprout className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-xs text-gray-400">
              © 2024 AgriHarvest. Cultivated trust since day one.
            </span>
          </div>
          <div className="flex items-center gap-5 text-xs text-gray-500">
            <a href="#" className="hover:text-green-700">Privacy Policy</a>
            <a href="#" className="hover:text-green-700">Terms of Service</a>
            <a href="#" className="hover:text-green-700">Shipping Info</a>
            <a href="#" className="hover:text-green-700">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
