import { useEffect, useMemo, useState, useCallback } from "react";
import {
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MoreVertical,
} from "lucide-react";
import EmployeeSidebar from "./Employeesidebar";
import EmployeeTopBar from "./EmployeeTopBar";
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
  const [tab, setTab] = useState("pending");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actingId, setActingId] = useState(null); // order id ที่กำลังกดอนุมัติ/ปฏิเสธ/ยกเลิก
  // เก็บ id ที่เพิ่งกด "อนุมัติ" สำเร็จในเซสชันนี้ ใช้กับสถิติ "อนุมัติแล้ววันนี้"
  // (backend ไม่มีฟิลด์ approvedAt เก็บวันที่อนุมัติจริง มีแต่ date = วันที่สร้างออเดอร์
  //  ถ้าใช้ o.date === today แบบเดิมจะได้ตัวเลขผิด เพราะเทียบวันที่สร้าง ไม่ใช่วันที่อนุมัติ)
  const [approvedTodayIds, setApprovedTodayIds] = useState(() => new Set());
  // ออเดอร์ที่กำลังจะยืนยันยกเลิก (เปิด modal แจ้งเตือนแทน window.confirm)
  const [cancelTarget, setCancelTarget] = useState(null);
  // id ของแถวที่เปิดเมนู MoreVertical อยู่ (เปลี่ยนสถานะ: เตรียมพัสดุ / จัดส่ง)
  const [openMenuId, setOpenMenuId] = useState(null);

  // ปิดเมนู dropdown เมื่อคลิกนอกเมนู
  useEffect(() => {
    if (!openMenuId) return;
    function handleClickOutside(e) {
      if (!e.target.closest("[data-order-menu]")) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

  // ดึงคำสั่งซื้อทั้งหมดครั้งเดียว ใช้คำนวณทั้งสถิติการ์ดด้านบนและตาราง (กรองตามแท็บฝั่ง client)
  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get("/api/orders");
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

  // แท็บ "อนุมัติแล้ว" ต้องรวมออเดอร์ที่กำลัง "เตรียมพัสดุ" ด้วย (จะหายไปจากแท็บนี้ก็ต่อเมื่อกด "จัดส่ง" แล้วเท่านั้น)
  const tableOrders = useMemo(() => {
    if (tab === "pending") return orders.filter((o) => o.status === "pending");
    if (tab === "approved")
      return orders.filter((o) => o.status === "approved" || o.status === "preparing");
    return orders;
  }, [orders, tab]);

  // กลับไปหน้า 1 ทุกครั้งที่เปลี่ยน tab หรือค้นหาใหม่
  useEffect(() => {
    setPage(1);
  }, [tab, query]);

  // ค้นหาด้วยข้อความ filter ที่ client บน tableOrders (ที่กรองตามแท็บมาแล้วจาก useMemo ด้านบน)
  const filteredOrders = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tableOrders;
    return tableOrders.filter(
      (o) =>
        String(o.id ?? "").toLowerCase().includes(q) ||
        String(o.customer ?? "").toLowerCase().includes(q)
    );
  }, [tableOrders, query]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const pagedOrders = filteredOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ถ้าหน้าปัจจุบันเกินจำนวนหน้าที่มีจริงแล้ว (เช่น อนุมัติ/ปฏิเสธ/ยกเลิกรายการสุดท้ายของหน้าสุดท้ายไป)
  // ให้ดึงกลับมาหน้าสุดท้ายที่ยังมีข้อมูลอยู่ ไม่ปล่อยให้ค้างเป็นหน้าว่าง
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const stats = useMemo(() => {
    const pending = orders.filter((o) => o.status === "pending");
    const approvedToday = orders.filter(
      (o) => o.status === "approved" && approvedTodayIds.has(o.id)
    );
    const pendingValue = pending.reduce((sum, o) => sum + (o.total || 0), 0);
    return [
      { label: "รอการอนุมัติ", value: String(pending.length) },
      { label: "มูลค่ารวม (รอตรวจสอบ)", value: `฿${pendingValue.toLocaleString()}` },
      { label: "คำสั่งซื้อทั้งหมด", value: String(orders.length) },
      { label: "อนุมัติแล้ววันนี้", value: String(approvedToday.length) },
    ];
  }, [orders, approvedTodayIds]);

  async function handleStatusChange(orderId, status) {
    if (status === "rejected") {
      const ok = window.confirm("ยืนยันปฏิเสธคำสั่งซื้อนี้? การกระทำนี้ย้อนกลับยาก");
      if (!ok) return;
    }
    setActingId(orderId);
    try {
      const data = await api.patch(`/api/orders/${orderId}/status`, { status });
      const updated = data?.order || data;

      // อัปเดตชุดข้อมูลเต็ม — tableOrders derive มาจาก orders อัตโนมัติผ่าน useMemo อยู่แล้ว
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, ...updated, status } : o))
      );

      if (status === "approved") {
        setApprovedTodayIds((prev) => new Set(prev).add(orderId));
      }
    } catch (err) {
      alert(err.message || "อัปเดตสถานะไม่สำเร็จ");
    } finally {
      setActingId(null);
    }
  }

  async function confirmCancelOrder() {
    if (!cancelTarget) return;
    const id = cancelTarget.id;
    setCancelTarget(null);
    await handleStatusChange(id, "cancelled");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <EmployeeSidebar />

      <main className="flex-1 overflow-y-auto px-6 py-6 md:px-10">
        <EmployeeTopBar
          search={query}
          onSearchChange={setQuery}
          searchPlaceholder="ค้นหาคำสั่งซื้อ..."
        />

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
                            : o.status === "preparing"
                            ? "bg-blue-50 text-blue-600"
                            : o.status === "shipping"
                            ? "bg-indigo-50 text-indigo-600"
                            : o.status === "rejected"
                            ? "bg-rose-50 text-rose-500"
                            : o.status === "cancelled"
                            ? "bg-slate-100 text-slate-500"
                            : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {o.status === "approved"
                          ? "ยืนยันคำสั่งซื้อ"
                          : o.status === "preparing"
                          ? "เตรียมพัสดุ"
                          : o.status === "shipping"
                          ? "จัดส่งแล้ว"
                          : o.status === "rejected"
                          ? "ปฏิเสธแล้ว"
                          : o.status === "cancelled"
                          ? "ยกเลิกแล้ว"
                          : "รอการตรวจสอบ"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className="relative flex items-center justify-end gap-2"
                        data-order-menu
                      >
                        {o.status === "pending" && (
                          <>
                            <button
                              type="button"
                              disabled={actingId === o.id}
                              onClick={() => handleStatusChange(o.id, "approved")}
                              className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {actingId === o.id ? "..." : "อนุมัติ"}
                            </button>
                            <button
                              type="button"
                              disabled={actingId === o.id}
                              onClick={() => handleStatusChange(o.id, "rejected")}
                              className="rounded-lg border border-rose-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              ปฏิเสธ
                            </button>
                          </>
                        )}
                        {o.status === "approved" && (
                          <button
                            type="button"
                            disabled={actingId === o.id}
                            onClick={() => setCancelTarget(o)}
                            className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {actingId === o.id ? "..." : "ยกเลิกคำสั่งซื้อ"}
                          </button>
                        )}
                        {o.status !== "pending" && (
                          <button
                            type="button"
                            aria-label="ตัวเลือกเพิ่มเติม"
                            onClick={() =>
                              setOpenMenuId((prev) => (prev === o.id ? null : o.id))
                            }
                            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-50"
                          >
                            <MoreVertical size={16} />
                          </button>
                        )}

                        {openMenuId === o.id && (
                          <div className="absolute right-0 top-9 z-10 w-40 overflow-hidden rounded-lg border border-slate-100 bg-white py-1 shadow-lg">
                            <button
                              type="button"
                              disabled={o.status !== "approved" || actingId === o.id}
                              onClick={() => {
                                setOpenMenuId(null);
                                handleStatusChange(o.id, "preparing");
                              }}
                              className="flex w-full items-center px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                            >
                              เตรียมพัสดุ
                            </button>
                            <button
                              type="button"
                              disabled={o.status !== "preparing" || actingId === o.id}
                              onClick={() => {
                                setOpenMenuId(null);
                                handleStatusChange(o.id, "shipping");
                              }}
                              className="flex w-full items-center px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                            >
                              กำลังจัดส่ง
                            </button>
                          </div>
                        )}
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

      {/* Modal ยืนยันยกเลิกคำสั่งซื้อ */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-800">
              ยืนยันยกเลิกคำสั่งซื้อ
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              คุณต้องการยกเลิกคำสั่งซื้อ{" "}
              <span className="font-medium text-slate-700">{cancelTarget.id}</span>{" "}
              ของ{" "}
              <span className="font-medium text-slate-700">
                {cancelTarget.customer || `User #${cancelTarget.userId}`}
              </span>{" "}
              ใช่หรือไม่? การกระทำนี้ย้อนกลับยาก
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCancelTarget(null)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                ไม่ยกเลิก
              </button>
              <button
                type="button"
                onClick={confirmCancelOrder}
                disabled={actingId === cancelTarget.id}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {actingId === cancelTarget.id ? "กำลังยกเลิก..." : "ยืนยันยกเลิก"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}