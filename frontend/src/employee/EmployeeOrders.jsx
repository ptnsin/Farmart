import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Bell,
  Image as ImageIcon,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import EmployeeSidebar from "./Employeesidebar";
import { getCachedUser, fetchCurrentUser } from "../data/authStore";

const TABS = [
  { key: "pending", label: "รอการตรวจสอบ" },
  { key: "all", label: "ทั้งหมด" },
  { key: "approved", label: "อนุมัติแล้ว" },
];

const ORDERS = [
  {
    id: "#AH-94821",
    customer: "คุณสมชาย รักเกษตร",
    email: "somchai.farm@gmail.com",
    avatar: "https://i.pravatar.cc/64?img=12",
    amount: 12500,
    method: "SCB Mobile Banking",
    status: "pending",
  },
  {
    id: "#AH-94825",
    customer: "กานดา เพลินจิตร",
    email: "kanda.j@organic.co.th",
    avatar: "https://i.pravatar.cc/64?img=32",
    amount: 3200,
    method: "K-Plus",
    status: "pending",
  },
  {
    id: "#AH-94829",
    customer: "ลุงบุญส่ง ตลาดไท",
    email: "boonsong_market@yahoo.com",
    avatar: "https://i.pravatar.cc/64?img=51",
    amount: 58900,
    method: "PromptPay Transfer",
    status: "pending",
  },
];

const STATS = [
  { label: "รอการอนุมัติ", value: "24", note: "+12% เทียบกับเมื่อวาน", noteColor: "text-emerald-600" },
  { label: "มูลค่ารวม", value: "฿450,200" },
  { label: "เวลารอเฉลี่ย", value: "42 นาที" },
  { label: "อนุมัติแล้ววันนี้", value: "156" },
];

function StatCard({ label, value, note, noteColor }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-800">{value}</p>
      {note && <p className={`mt-1 text-xs font-medium ${noteColor || "text-slate-400"}`}>{note}</p>}
    </div>
  );
}

export default function EmployeeOrders() {
  const [user, setUser] = useState(getCachedUser());
  const [tab, setTab] = useState("pending");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchCurrentUser().then(setUser).catch(() => {});
  }, []);

  const filteredOrders = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ORDERS.filter((o) => {
      const matchesTab = tab === "all" || o.status === tab;
      const matchesQuery =
        !q || o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q);
      return matchesTab && matchesQuery;
    });
  }, [tab, query]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <EmployeeSidebar />

      <main className="flex-1 overflow-y-auto px-6 py-6 md:px-10">
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
              placeholder="ค้นหาคำสั่งซื้อ..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <button
            type="button"
            aria-label="แจ้งเตือน"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:bg-slate-50"
          >
            <Bell size={18} />
          </button>
          <div className="flex items-center gap-3 rounded-full border border-slate-200 py-1.5 pl-1.5 pr-4">
            <img
              src={user?.avatar || "https://i.pravatar.cc/64?img=5"}
              alt=""
              className="h-8 w-8 rounded-full object-cover"
            />
            <div className="leading-tight">
              <p className="text-sm font-medium text-slate-800">{user?.name || "พนักงาน"}</p>
              <p className="text-xs text-slate-400">Warehouse Staff</p>
            </div>
          </div>
        </div>

        {/* Heading + tabs */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">อนุมัติคำสั่งซื้อ</h1>
            <p className="mt-1 text-sm text-slate-400">
              ตรวจสอบการชำระเงินและอนุมัติการจัดส่งสินค้าเกษตร
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-slate-200 bg-white p-1">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${tab === t.key
                      ? "bg-emerald-600 text-white"
                      : "text-slate-500 hover:text-slate-700"
                    }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <SlidersHorizontal size={14} />
              ตัวกรอง
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STATS.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        {/* Table */}
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-100 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-400">
                <th className="px-6 py-3 font-medium">เลขออเดอร์</th>
                <th className="px-6 py-3 font-medium">ชื่อลูกค้า</th>
                <th className="px-6 py-3 font-medium">ยอดชำระ</th>
                <th className="px-6 py-3 font-medium">หลักฐานการโอน</th>
                <th className="px-6 py-3 font-medium">สถานะ</th>
                <th className="px-6 py-3 text-right font-medium">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => (
                <tr key={o.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-6 py-4 font-medium text-slate-800">{o.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={o.avatar}
                        alt=""
                        className="h-9 w-9 rounded-full object-cover"
                      />
                      <div className="leading-tight">
                        <p className="font-medium text-slate-800">{o.customer}</p>
                        <p className="text-xs text-slate-400">{o.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-800">
                      ฿{o.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-slate-400">{o.method}</p>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:underline"
                    >
                      <ImageIcon size={14} />
                      ดูหลักฐาน
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-600">
                      รอการตรวจสอบ
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                      >
                        อนุมัติ
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-rose-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-50"
                      >
                        ปฏิเสธ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-400">
                    ไม่พบคำสั่งซื้อที่ตรงกับเงื่อนไข
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3.5">
            <p className="text-sm text-slate-400">
              แสดง {filteredOrders.length} จาก 24 รายการที่รอการอนุมัติ
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="หน้าก่อนหน้า"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-50"
              >
                <ChevronLeft size={16} />
              </button>
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className={`flex h-7 w-7 items-center justify-center rounded-md text-sm font-medium ${page === n
                      ? "bg-emerald-600 text-white"
                      : "text-slate-500 hover:bg-slate-50"
                    }`}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                aria-label="หน้าถัดไป"
                onClick={() => setPage((p) => Math.min(3, p + 1))}
                className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}