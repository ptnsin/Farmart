import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Search,
  Bell,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import EmployeeSidebar from "./Employeesidebar";
import { getCachedUser, fetchCurrentUser } from "../data/authStore";
import { api } from "../data/apiClient";

const TABS = [
  { key: "pending", label: "รอการตรวจสอบ" },
  { key: "all", label: "ทั้งหมด" },
  { key: "approved", label: "อนุมัติแล้ว" },
];

// map paymentMethod ที่เก็บใน orders.json ให้เป็นข้อความไทย
const PAYMENT_LABELS = {
  promptpay: "PromptPay",
  bank: "โอนผ่านธนาคาร",
  cod: "เก็บเงินปลายทาง",
  card: "บัตรเครดิต/เดบิต",
  transfer: "โอนเงิน",
};

const PAGE_SIZE = 10;

function StatCard({ label, value, note, noteColor }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-800">{value}</p>
      {note && (
        <p className={`mt-1 text-xs font-medium ${noteColor || "text-slate-400"}`}>
          {note}
        </p>
      )}
    </div>
  );
}

export default function EmployeeOrders() {
  const [user, setUser] = useState(getCachedUser());
  const [tab, setTab] = useState("pending");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actingId, setActingId] = useState(null); // order id ที่กำลังกดอนุมัติ/ปฏิเสธ

  useEffect(() => {
    fetchCurrentUser().then(setUser).catch(() => {});
  }, []);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get("/api/orders");
      // รองรับทั้งกรณี backend ตอบเป็น array ตรง ๆ หรือ { orders: [...] }
      setOrders(Array.isArray(data) ? data : data.orders || []);
    } catch (err) {
      setError(err.message || "โหลดคำสั่งซื้อไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // กลับไปหน้า 1 ทุกครั้งที่เปลี่ยน tab หรือค้นหาใหม่
  useEffect(() => {
    setPage(1);
  }, [tab, query]);

  const filteredOrders = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      const matchesTab = tab === "all" || o.status === tab;
      const matchesQuery =
        !q ||
        o.id.toLowerCase().includes(q) ||
        (o.customer || "").toLowerCase().includes(q);
      return matchesTab && matchesQuery;
    });
  }, [orders, tab, query]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const pagedOrders = filteredOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = useMemo(() => {
    const pending = orders.filter((o) => o.status === "pending");
    const today = new Date().toISOString().slice(0, 10);
    const approvedToday = orders.filter((o) => o.status === "approved" && o.date === today);
    const pendingValue = pending.reduce((sum, o) => sum + (o.total || 0), 0);
    return [
      { label: "รอการอนุมัติ", value: String(pending.length) },
      { label: "มูลค่ารวม (รอตรวจสอบ)", value: `฿${pendingValue.toLocaleString()}` },
      { label: "คำสั่งซื้อทั้งหมด", value: String(orders.length) },
      { label: "อนุมัติแล้ววันนี้", value: String(approvedToday.length) },
    ];
  }, [orders]);

  async function handleStatusChange(orderId, status) {
    setActingId(orderId);
    try {
      const data = await api.patch(`/api/orders/${orderId}/status`, { status });
      const updated = data?.order || data;
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, ...updated, status } : o))
      );
    } catch (err) {
      alert(err.message || "อัปเดตสถานะไม่สำเร็จ");
    } finally {
      setActingId(null);
    }
  }

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
              <p className="text-xs text-slate-400">{user?.role || "Warehouse Staff"}</p>
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
                  className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    tab === t.key
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
              onClick={loadOrders}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <SlidersHorizontal size={14} />
              รีเฟรช
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        {/* Table */}
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-100 bg-white">
          {error && (
            <div className="border-b border-rose-100 bg-rose-50 px-6 py-3 text-sm text-rose-600">
              {error}{" "}
              <button type="button" onClick={loadOrders} className="ml-2 underline">
                ลองใหม่
              </button>
            </div>
          )}

          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-400">
                <th className="px-6 py-3 font-medium">เลขออเดอร์</th>
                <th className="px-6 py-3 font-medium">ชื่อลูกค้า</th>
                <th className="px-6 py-3 font-medium">ยอดชำระ</th>
                <th className="px-6 py-3 font-medium">ช่องทางชำระเงิน</th>
                <th className="px-6 py-3 font-medium">สถานะ</th>
                <th className="px-6 py-3 text-right font-medium">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-400">
                    <Loader2 className="mx-auto mb-2 animate-spin" size={20} />
                    กำลังโหลดคำสั่งซื้อ...
                  </td>
                </tr>
              ) : pagedOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-400">
                    ไม่พบคำสั่งซื้อที่ตรงกับเงื่อนไข
                  </td>
                </tr>
              ) : (
                pagedOrders.map((o) => (
                  <tr key={o.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-6 py-4 font-medium text-slate-800">{o.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={o.items?.[0]?.image || "https://i.pravatar.cc/64"}
                          alt=""
                          className="h-9 w-9 rounded-full object-cover"
                        />
                        <div className="leading-tight">
                          <p className="font-medium text-slate-800">
                            {o.customer || `User #${o.userId}`}
                          </p>
                          <p className="text-xs text-slate-400">
                            {o.items?.length || 0} รายการสินค้า
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">
                        ฿{(o.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {PAYMENT_LABELS[o.paymentMethod] || o.paymentMethod}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                          o.status === "approved"
                            ? "bg-emerald-50 text-emerald-600"
                            : o.status === "rejected"
                            ? "bg-rose-50 text-rose-500"
                            : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {o.statusLabel ||
                          (o.status === "approved"
                            ? "อนุมัติแล้ว"
                            : o.status === "rejected"
                            ? "ปฏิเสธแล้ว"
                            : "รอการตรวจสอบ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          disabled={o.status !== "pending" || actingId === o.id}
                          onClick={() => handleStatusChange(o.id, "approved")}
                          className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {actingId === o.id ? "..." : "อนุมัติ"}
                        </button>
                        <button
                          type="button"
                          disabled={o.status !== "pending" || actingId === o.id}
                          onClick={() => handleStatusChange(o.id, "rejected")}
                          className="rounded-lg border border-rose-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          ปฏิเสธ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3.5">
            <p className="text-sm text-slate-400">
              แสดง {pagedOrders.length} จาก {filteredOrders.length} รายการ
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className={`flex h-7 w-7 items-center justify-center rounded-md text-sm font-medium ${
                    page === n
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
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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