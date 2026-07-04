import { useState } from "react";
import {
  Search,
  Truck,
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  Filter,
  ChevronDown,
  MoreVertical,
  Navigation,
  MapPin,
  Package,
} from "lucide-react";
import AdminSidebar from "./AdminSidebar";

const STATS = [
  {
    icon: Truck,
    tone: "emerald",
    label: "กำลังจัดส่ง",
    value: "142",
    delta: "+12%",
  },
  {
    icon: ClipboardList,
    tone: "slate",
    label: "รอดำเนินการ",
    value: "28",
    delta: "-2%",
  },
  {
    icon: CheckCircle2,
    tone: "emerald",
    label: "ส่งสำเร็จวันนี้",
    value: "89",
    delta: "+5%",
  },
  {
    icon: AlertTriangle,
    tone: "rose",
    label: "ปัญหาการส่ง",
    value: "3",
    delta: "1 ปัญหา",
  },
];

const TONE_ICON = {
  emerald: "bg-emerald-50 text-emerald-600",
  slate: "bg-slate-100 text-slate-500",
  rose: "bg-rose-50 text-rose-500",
};

const TONE_DELTA = {
  emerald: "text-emerald-600",
  slate: "text-slate-400",
  rose: "text-rose-500",
};

const ORDERS = [
  {
    id: "#ORD-2023-001",
    date: "12 ต.ค. 2023 09:45",
    customer: "คุณกิตติ ศักดิ์ทอง",
    driver: "สมชาย ใจดี",
    method: "แบบเย็น",
    progress: 85,
    tone: "good",
  },
  {
    id: "#ORD-2023-005",
    date: "12 ต.ค. 2023 08:30",
    customer: "วิสาหกิจชุมชนพืชไร่",
    driver: "-",
    method: "พัสดุธรรมดา",
    progress: 30,
    tone: "warn",
  },
  {
    id: "#ORD-2023-012",
    date: "12 ต.ค. 2023 10:15",
    customer: "ร้านโรงปุ๋ยมาร์เก็ต",
    driver: "-",
    method: "แบบเย็น",
    progress: 55,
    tone: "good",
  },
];

const AREA_SHARE = [
  { label: "กรุงเทพ และปริมณฑล", pct: 65, tone: "bg-emerald-600" },
  { label: "ภาคกลาง", pct: 20, tone: "bg-emerald-400" },
  { label: "อื่นๆ", pct: 15, tone: "bg-slate-300" },
];

function StatCard({ icon: Icon, tone, label, value, delta }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${TONE_ICON[tone]}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-xl font-bold text-slate-800">{value}</p>
      </div>
      <span className={`ml-auto self-start text-xs font-semibold ${TONE_DELTA[tone]}`}>
        {delta}
      </span>
    </div>
  );
}

export default function AdminShipping() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto px-6 py-6 md:px-8">
        {/* Top bar */}
        <div className="mb-8 flex items-center gap-4">
          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="ค้นหาออเดอร์หรือชื่อลูกค้า..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div className="flex items-center gap-3 rounded-full border border-slate-200 py-1.5 pl-1.5 pr-4">
            <img
              src="https://i.pravatar.cc/64?img=12"
              alt=""
              className="h-8 w-8 rounded-full object-cover"
            />
            <div className="leading-tight">
              <p className="text-sm font-medium text-slate-800">Admin User</p>
              <p className="text-xs text-slate-400">Logistics Manager</p>
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-slate-800">สถานะการจัดส่งสินค้า</h1>
        <p className="mt-1 text-sm text-slate-400">
          ภาพรวมและการติดตามการจัดส่งแบบเรียลไทม์
        </p>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <span className="flex items-center gap-1.5">
            <Filter size={14} />
            กรองตาม:
          </span>
          <button className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700">
            สถานะทั้งหมด
            <ChevronDown size={14} />
          </button>
          <button className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700">
            พนักงานทุกคน
            <ChevronDown size={14} />
          </button>
          <input
            type="text"
            placeholder="mm/dd/yyyy"
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-500 outline-none"
          />
        </div>

        {/* Content: table + side panel */}
        <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Orders table */}
          <div className="overflow-hidden rounded-xl border border-slate-100 bg-white lg:col-span-2">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-400">
                  <th className="px-5 py-3 font-medium">เลขที่คำสั่งซื้อ</th>
                  <th className="px-3 py-3 font-medium">ลูกค้า</th>
                  <th className="px-3 py-3 font-medium">พนักงานส่ง</th>
                  <th className="px-3 py-3 font-medium">รูปแบบ</th>
                  <th className="px-3 py-3 font-medium">สถานะ</th>
                  <th className="px-3 py-3 text-right font-medium">การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {ORDERS.map((o) => (
                  <tr key={o.id} className="border-b border-slate-50 last:border-0 align-top">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-800">{o.id}</p>
                      <p className="text-xs text-slate-400">{o.date}</p>
                    </td>
                    <td className="px-3 py-3.5 text-slate-600">{o.customer}</td>
                    <td className="px-3 py-3.5 text-slate-600">{o.driver}</td>
                    <td className="px-3 py-3.5">
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                        <Package size={12} />
                        {o.method}
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="h-1.5 w-24 rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${
                            o.tone === "good" ? "bg-emerald-500" : "bg-amber-400"
                          }`}
                          style={{ width: `${o.progress}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-right">
                      <button className="text-slate-400 hover:text-slate-600">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-sm">
              <p className="text-xs text-slate-400">แสดง 1-10 จาก 152 รายการ</p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-md border border-slate-200 px-3 py-1 text-xs text-slate-500 hover:bg-slate-50"
                >
                  ก่อนหน้า
                </button>
                <button
                  onClick={() => setPage(1)}
                  className={`h-7 w-7 rounded-md text-xs ${
                    page === 1 ? "bg-emerald-700 font-semibold text-white" : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  1
                </button>
                <button
                  onClick={() => setPage(2)}
                  className={`h-7 w-7 rounded-md text-xs ${
                    page === 2 ? "bg-emerald-700 font-semibold text-white" : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  2
                </button>
                <button className="rounded-md border border-slate-200 px-3 py-1 text-xs text-slate-500 hover:bg-slate-50">
                  ถัดไป
                </button>
              </div>
            </div>
          </div>

          {/* Side panel: route map + area share */}
          <div className="space-y-6">
            <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
              <div className="flex items-center justify-between px-4 py-3">
                <h3 className="text-sm font-semibold text-slate-800">เส้นทางจัดส่งปัจจุบัน</h3>
                <button className="flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800">
                  ดูเส้นทางเต็ม
                  <Navigation size={12} />
                </button>
              </div>

              <div className="relative h-56 overflow-hidden bg-slate-100">
                <svg viewBox="0 0 300 220" className="h-full w-full">
                  <rect width="300" height="220" fill="#eef1ec" />
                  <path d="M0 60 L300 40" stroke="#dbe2d6" strokeWidth="6" />
                  <path d="M0 140 L300 170" stroke="#dbe2d6" strokeWidth="6" />
                  <path d="M40 0 L20 220" stroke="#dbe2d6" strokeWidth="6" />
                  <path d="M220 0 L260 220" stroke="#dbe2d6" strokeWidth="6" />
                  <path
                    d="M70 40 C 120 90, 140 60, 180 110 S 230 150, 230 150"
                    fill="none"
                    stroke="#2f7d4f"
                    strokeWidth="3"
                    strokeDasharray="6 5"
                  />
                  <circle cx="70" cy="40" r="6" fill="#2f7d4f" />
                  <circle cx="230" cy="150" r="6" fill="#0f766e" />
                </svg>

                <div className="absolute bottom-2 left-2 right-2 flex items-start gap-2 rounded-lg bg-white/95 p-2.5 shadow-sm">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <MapPin size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      รถขนส่งสาย 04 (เส้นทางเหนือ)
                    </p>
                    <p className="text-[11px] text-slate-400">
                      กำลังมุ่งหน้า อ.บางแก้ว · ห่างจากจุดหมาย 5.2 กม.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-slate-800">
                สัดส่วนพื้นที่การส่งวันนี้
              </h3>
              <div className="space-y-3">
                {AREA_SHARE.map((a) => (
                  <div key={a.label}>
                    <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                      <span>{a.label}</span>
                      <span className="font-semibold text-slate-700">{a.pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${a.tone}`}
                        style={{ width: `${a.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}