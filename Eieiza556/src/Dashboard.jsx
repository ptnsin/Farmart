import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  Bell,
  UserCircle2,
  HelpCircle,
  Wallet,
  ClipboardList,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  ExternalLink,
  LogOut,
  Store,
} from "lucide-react";

const stats = [
  {
    label: "รายได้รวมเดือนนี้",
    value: "1,284,500",
    delta: "+12.5%",
    trend: "up",
    icon: Wallet,
  },
  {
    label: "จำนวนคำสั่งซื้อ",
    value: "342 รายการ",
    delta: "+8.2%",
    trend: "up",
    icon: ClipboardList,
  },
  {
    label: "มูลค่าเฉลี่ยต่อคำสั่งซื้อ",
    value: "3,755",
    delta: "-2.4%",
    trend: "down",
    icon: () => <span className="text-lg leading-none">฿</span>,
  },
];

// Bar chart data (relative heights)
const chartData = [
  { time: "08:00", value: 45 },
  { time: "10:00", value: 68 },
  { time: "12:00", value: 58 },
  { time: "14:00", value: 82 },
  { time: "16:00", value: 96 },
  { time: "18:00", value: 70 },
  { time: "20:00", value: 74 },
  { time: "22:00", value: 60 },
  { time: "00:00", value: 34 },
  { time: "02:00", value: 20 },
  { time: "04:00", value: 12 },
];

const products = [
  {
    name: "ชุดปลูกผักไฮโดรโปนิกส์ Pro",
    category: "อุปกรณ์การเกษตร",
    stock: 156,
    revenue: "฿452,400",
    trend: "up",
    trendLabel: "สูงมาก",
    emoji: "🌱",
  },
  {
    name: "เมล็ดพันธุ์กะหล่ำปลีม่วง (นำเข้า)",
    category: "เมล็ดพันธุ์",
    stock: 12,
    revenue: "฿3,840",
    trend: "down",
    trendLabel: "ต่ำ",
    emoji: "🥬",
  },
  {
    name: "เซนเซอร์วัดความชื้นดิน SmartSoil",
    category: "เทคโนโลยี",
    stock: 84,
    revenue: "฿126,000",
    trend: "up",
    trendLabel: "ปานกลาง",
    emoji: "📡",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [range, setRange] = useState("รายวัน");
  const [user, setUser] = useState(null);
  const maxValue = Math.max(...chartData.map((d) => d.value));

  useEffect(() => {
    const isAuthed = localStorage.getItem("agriharvest_auth");
    if (!isAuthed) {
      navigate("/");
      return;
    }
    const saved = localStorage.getItem("agriharvest_user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        setUser(null);
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("agriharvest_auth");
    localStorage.removeItem("agriharvest_user");
    navigate("/");
  };

  return (
    <div className="min-h-screen w-full flex bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-gray-200 bg-white">
        <Link to="/home" className="px-6 py-6 flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-green-800 flex items-center justify-center text-white text-sm font-bold">
            A
          </div>
          <span className="font-bold text-gray-900">employee</span>
        </Link>

        <nav className="flex-1 px-3 space-y-1">
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-green-50 text-green-800 font-semibold text-sm"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </a>
          <Link
            to="/home"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 hover:bg-gray-50 text-sm"
          >
            <Store className="w-4 h-4" />
            หน้าร้านค้า
          </Link>
        </nav>

        <div className="px-3 pb-6 space-y-1 border-t border-gray-100 pt-4">
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 hover:bg-gray-50 text-sm"
          >
            <HelpCircle className="w-4 h-4" />
            Help Center
          </a>
          <div className="flex items-center gap-3 px-3 py-2.5">
            <div className="w-8 h-8 rounded-full bg-green-800 flex items-center justify-center text-white text-xs font-bold">
              ST
            </div>
            <div className="leading-tight min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {user?.email || "Staff Member"}
              </p>
              <p className="text-[11px] text-gray-400">ENTERPRISE HUB</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 hover:bg-gray-50 text-sm w-full"
          >
            <LogOut className="w-4 h-4" />
            ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-6 py-4 border-b border-gray-200 bg-white">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาข้อมูล สินค้า หรือรายงาน..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
            />
          </div>
          <button className="ml-auto w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100">
            <Bell className="w-5 h-5" />
          </button>
          <button className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100">
            <UserCircle2 className="w-6 h-6" />
          </button>
        </header>

        {/* Page body */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title row */}
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">ภาพรวมแผงควบคุม</h1>
              <p className="text-sm text-gray-500 mt-1">
                ข้อมูลสรุปผลการดำเนินงานวันที่ 24 พฤษภาคม 2567
              </p>
            </div>
            <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 text-sm">
              {["รายวัน", "รายเดือน", "รายปี"].map((label) => (
                <button
                  key={label}
                  onClick={() => setRange(label)}
                  className={`px-3.5 py-1.5 rounded-md font-medium transition-colors ${
                    range === label
                      ? "bg-green-900 text-white"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              const isUp = stat.trend === "up";
              return (
                <div
                  key={stat.label}
                  className="bg-white border border-gray-200 rounded-xl p-5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-700">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span
                      className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                        isUp
                          ? "text-green-700 bg-green-50"
                          : "text-red-600 bg-red-50"
                      }`}
                    >
                      {isUp ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      )}
                      {stat.delta}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              );
            })}
          </div>

          {/* Chart */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-gray-900">วิเคราะห์แนวโน้มยอดขาย</h2>
              <a
                href="#"
                className="flex items-center gap-1 text-sm text-green-700 font-medium hover:underline"
              >
                รายงานฉบับเต็ม
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="flex items-end gap-3 h-56">
              {chartData.map((d) => (
                <div key={d.time} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full max-w-10 rounded-t-md bg-green-800 hover:bg-green-700 transition-colors"
                    style={{ height: `${(d.value / maxValue) * 100}%` }}
                  />
                  <span className="text-[11px] text-gray-400">{d.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Product performance table */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h2 className="font-semibold text-gray-900">
                ประสิทธิภาพรายสินค้า (ยอดนิยม &amp; อัตราการขายต่ำ)
              </h2>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-600" />
                  สินค้าขายดี
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  สินค้าเคลื่อนไหวช้า
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 text-xs uppercase tracking-wide border-b border-gray-100">
                    <th className="py-2.5 font-medium">ชื่อสินค้า</th>
                    <th className="py-2.5 font-medium">หมวดหมู่</th>
                    <th className="py-2.5 font-medium">ยอดขาย (หน่วย)</th>
                    <th className="py-2.5 font-medium">รายได้</th>
                    <th className="py-2.5 font-medium">สถานการณ์เคลื่อนไหว</th>
                    <th className="py-2.5 font-medium text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const isUp = p.trend === "up";
                    return (
                      <tr
                        key={p.name}
                        className="border-b border-gray-50 last:border-0"
                      >
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center gap-3">
                            <span className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-lg">
                              {p.emoji}
                            </span>
                            <span className="font-medium text-gray-800">{p.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 text-gray-500">{p.category}</td>
                        <td className="py-3.5 text-gray-800">{p.stock}</td>
                        <td className="py-3.5 text-gray-800 font-medium">{p.revenue}</td>
                        <td className="py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-semibold ${
                              isUp ? "text-green-700" : "text-red-500"
                            }`}
                          >
                            {isUp ? (
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowDownRight className="w-3.5 h-3.5" />
                            )}
                            {p.trendLabel}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <button className="text-gray-400 hover:text-gray-700 p-1">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 pt-4">
            © 2024 AgriHarvest Enterprise Hub. ระบบจัดการเกษตรอัจฉริยะ เวอร์ชั่น 2.4.1
          </p>
        </main>
      </div>
    </div>
  );
}
