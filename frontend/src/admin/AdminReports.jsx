import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  BarChart3,
  TrendingUp,
  Users,
  ShoppingBag,
  AlertTriangle,
  Truck,
  PackageX,
  ServerCrash,
  User,
} from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import { getCachedUser, fetchCurrentUser } from "../data/authStore";
import { fetchReportsOverview, fetchEmployeeIssues } from "../data/reportsStore";

// ไอคอน/สีของแต่ละ stat card ผูกกับ key ที่ backend ส่งกลับมา (revenue, orders, newCustomers)
const STAT_META = {
  revenue: {
    label: "ยอดขายรวม (เดือนนี้)",
    icon: TrendingUp,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    format: (v) => `฿${Number(v).toLocaleString()}`,
  },
  orders: {
    label: "จำนวนคำสั่งซื้อ",
    icon: ShoppingBag,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-500",
    format: (v) => Number(v).toLocaleString(),
  },
  newCustomers: {
    label: "ลูกค้าใหม่",
    icon: Users,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-500",
    format: (v) => Number(v).toLocaleString(),
  },
};

function formatChangeNote(changePct) {
  if (changePct == null) return "";
  const sign = changePct > 0 ? "+" : "";
  return `${sign}${changePct}% จากเดือนที่แล้ว`;
}

const ISSUE_TYPES = {
  delivery: { label: "จัดส่งไม่สำเร็จ", icon: Truck, color: "text-rose-600 bg-rose-50" },
  stock: { label: "สินค้าไม่ตรงกับสต็อก", icon: PackageX, color: "text-amber-600 bg-amber-50" },
  system: { label: "ระบบขัดข้อง", icon: ServerCrash, color: "text-slate-600 bg-slate-100" },
};

const PRIORITY_STYLES = {
  high: "bg-rose-50 text-rose-600",
  medium: "bg-amber-50 text-amber-600",
  low: "bg-slate-100 text-slate-500",
};

const STATUS_STYLES = {
  open: { label: "รอดำเนินการ", dot: "bg-amber-500", text: "text-amber-600" },
  resolved: { label: "แก้ไขแล้ว", dot: "bg-emerald-500", text: "text-emerald-600" },
};

function StatCard({ label, value, note, icon: Icon, iconBg, iconColor }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className={`flex h-11 w-11 items-center justify-center rounded-full ${iconBg} ${iconColor}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs font-medium tracking-wide text-slate-400">{label}</p>
        <p className="text-2xl font-semibold text-slate-800">{value}</p>
        <p className="text-xs text-slate-400">{note}</p>
      </div>
    </div>
  );
}

export default function AdminReports() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(getCachedUser());

  const [overview, setOverview] = useState(null); // { stats, monthlySales, topProducts }
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCurrentUser()
      .then(setCurrentUser)
      .catch((err) => {
        if (err.message.includes("เข้าสู่ระบบ")) navigate("/");
      });
  }, [navigate]);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError(null);
      try {
        const [overviewData, issuesData] = await Promise.all([
          fetchReportsOverview(),
          fetchEmployeeIssues(),
        ]);
        if (cancelled) return;
        setOverview(overviewData);
        setIssues(issuesData.tickets || []);
      } catch (err) {
        if (cancelled) return;
        if (err.message.includes("เข้าสู่ระบบ")) {
          navigate("/");
          return;
        }
        setError(err.message || "โหลดข้อมูลแดชบอร์ดไม่สำเร็จ");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const monthlySales = overview?.monthlySales || [];
  const maxValue = monthlySales.length ? Math.max(...monthlySales.map((m) => m.value)) : 1;
  const topProducts = overview?.topProducts || [];
  const statEntries = overview?.stats
    ? Object.entries(overview.stats).filter(([key]) => STAT_META[key])
    : [];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto px-6 py-6 md:px-10">
        {/* Top bar */}
        <div className="mb-8 flex items-center gap-4">
          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="ค้นหารายงานหรือสถิติ..."
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
              src={currentUser?.avatar || "https://i.pravatar.cc/64?img=12"}
              alt=""
              className="h-8 w-8 rounded-full object-cover"
            />
            <div className="leading-tight">
              <p className="text-sm font-medium text-slate-800">{currentUser?.name || "Admin"}</p>
              <p className="text-xs text-slate-400">{currentUser?.role || "Admin"}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-emerald-700">
          <BarChart3 size={20} />
          <h1 className="text-2xl font-semibold text-slate-800">รายงาน/สถิติ</h1>
        </div>
        <p className="mt-1 text-sm text-slate-400">
          ภาพรวมยอดขาย คำสั่งซื้อ และสินค้าขายดีของระบบ Farmart
        </p>

        {error && (
          <div className="mt-4 flex items-center justify-between rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="font-medium underline underline-offset-2"
            >
              ลองใหม่
            </button>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[92px] animate-pulse rounded-xl border border-slate-100 bg-white shadow-sm"
                />
              ))
            : statEntries.map(([key, data]) => {
                const meta = STAT_META[key];
                return (
                  <StatCard
                    key={key}
                    label={meta.label}
                    value={meta.format(data.value)}
                    note={formatChangeNote(data.changePct)}
                    icon={meta.icon}
                    iconBg={meta.iconBg}
                    iconColor={meta.iconColor}
                  />
                );
              })}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Sales chart */}
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="text-base font-semibold text-slate-800">ยอดขายรายเดือน</h2>
            <div className="mt-6 flex items-end gap-4" style={{ height: 180 }}>
              {loading ? (
                <div className="flex h-full w-full items-end gap-4">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="flex-1 animate-pulse rounded-t-md bg-slate-100" style={{ height: "60%" }} />
                  ))}
                </div>
              ) : monthlySales.length === 0 ? (
                <p className="w-full text-center text-sm text-slate-400">ยังไม่มีข้อมูลยอดขาย</p>
              ) : (
                monthlySales.map((m) => (
                  <div key={m.month} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t-md bg-emerald-500"
                      style={{ height: `${(m.value / maxValue) * 140}px` }}
                    />
                    <p className="text-xs text-slate-400">{m.label}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top products */}
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-800">สินค้าขายดี</h2>
            <div className="mt-4 space-y-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100" />
                ))
              ) : topProducts.length === 0 ? (
                <p className="text-center text-sm text-slate-400">ยังไม่มีข้อมูลสินค้าขายดี</p>
              ) : (
                topProducts.map((p, i) => (
                  <div key={p.id || p.name} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-semibold text-emerald-700">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">{p.name}</p>
                      <p className="text-xs text-slate-400">
                        {p.category} · ขายแล้ว {p.sold.toLocaleString()} หน่วย
                      </p>
                    </div>
                    <p className="whitespace-nowrap text-sm font-medium text-emerald-700">
                      ฿{Number(p.revenue).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Employee-reported issues */}
        <div className="mt-6 rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-800">
              <AlertTriangle size={18} className="text-rose-500" />
              ปัญหาที่พนักงานแจ้งเข้ามา
            </h2>
            <span className="text-xs text-slate-400">
              {issues.filter((i) => i.status !== "resolved").length} รายการรอดำเนินการ
            </span>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-slate-100">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-400">
                  <th className="px-6 py-3 font-medium">รหัส</th>
                  <th className="px-6 py-3 font-medium">พนักงาน</th>
                  <th className="px-6 py-3 font-medium">ประเภทปัญหา</th>
                  <th className="px-6 py-3 font-medium">ที่เกี่ยวข้อง</th>
                  <th className="px-6 py-3 font-medium">รายละเอียด</th>
                  <th className="px-6 py-3 font-medium">ความสำคัญ</th>
                  <th className="px-6 py-3 font-medium">วันที่แจ้ง</th>
                  <th className="px-6 py-3 font-medium">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-sm text-slate-400">
                      กำลังโหลดข้อมูล...
                    </td>
                  </tr>
                )}
                {!loading &&
                  issues.map((issue) => {
                    const type = ISSUE_TYPES[issue.type];
                    const TypeIcon = type.icon;
                    const status = STATUS_STYLES[issue.status];
                    return (
                      <tr key={issue.id} className="border-b border-slate-50 last:border-0">
                        <td className="px-6 py-3.5 font-medium text-slate-800">#{issue.id}</td>
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                              <User size={13} />
                            </span>
                            <div>
                              <p className="text-slate-700">{issue.reportedBy?.name || "ไม่ทราบชื่อ"}</p>
                              <p className="text-xs text-slate-400">พนักงาน</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${type.color}`}
                          >
                            <TypeIcon size={12} />
                            {type.label}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-slate-500">{issue.relatedRef || "-"}</td>
                        <td className="max-w-xs px-6 py-3.5 text-slate-600">
                          <p className="font-medium text-slate-700">{issue.subject}</p>
                          <p className="text-xs text-slate-400">{issue.message}</p>
                        </td>
                        <td className="px-6 py-3.5">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${PRIORITY_STYLES[issue.priority]}`}
                          >
                            {issue.priority === "high"
                              ? "สูง"
                              : issue.priority === "medium"
                              ? "กลาง"
                              : "ต่ำ"}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-slate-500">
                          {new Date(`${issue.date}T00:00:00`).toLocaleDateString("th-TH", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-3.5">
                          <span className={`flex items-center gap-1.5 whitespace-nowrap ${status.text}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                {!loading && issues.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-sm text-slate-400">
                      ยังไม่มีปัญหาที่พนักงานแจ้งเข้ามา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}