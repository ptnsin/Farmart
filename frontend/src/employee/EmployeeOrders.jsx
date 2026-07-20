import { useEffect, useMemo, useState, useCallback } from "react";
import {
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MoreVertical,
  X,
} from "lucide-react";
import EmployeeSidebar from "./Employeesidebar";
import EmployeeTopBar from "./EmployeeTopBar";
import { api } from "../data/apiClient";
import { addNotification } from "../data/notificationStore";

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

const DELIVERY_LABELS = {
  standard: "จัดส่งมาตรฐาน (3-5 วันทำการ)",
  express: "จัดส่งด่วน (1-2 วันทำการ)",
};

const PAGE_SIZE = 10;

// สร้าง fallback avatar ที่ "คงที่" ตาม id เดิมเสมอ (pravatar.cc มีรูป img=1 ถึง img=70 เท่านั้น)
// ถ้าเรียก https://i.pravatar.cc/64 เฉยๆ โดยไม่ระบุ ?img= มันจะสุ่มรูปใหม่ทุกครั้งที่ยิง request
// ทำให้รูปโปรไฟล์ "เปลี่ยนทุกครั้งที่รีเฟรช" — จึงต้อง seed ด้วย id เพื่อให้ได้รูปเดิมเสมอ
function getFallbackAvatar(seed) {
  const n = Number(seed);
  const safeSeed = Number.isFinite(n) && n > 0 ? n : 1;
  return `https://i.pravatar.cc/64?img=${(safeSeed % 70) + 1}`;
}

// ดึงรูปโปรไฟล์ลูกค้าโดย join จาก userAvatarMap (userId -> avatar)
// ถ้าไม่พบ ให้ fallback ไปที่รูปสินค้าชิ้นแรก แล้วค่อย fallback ไปที่ placeholder ที่ seed คงที่ตาม userId/orderId
function getCustomerAvatar(o, userAvatarMap) {
  return (
    userAvatarMap[o.userId] ||
    o.items?.[0]?.image ||
    getFallbackAvatar(o.userId ?? o.id)
  );
}

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
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actingId, setActingId] = useState(null); // order id ที่กำลังกดอนุมัติ/ปฏิเสธ/ยกเลิก
  // ออเดอร์ที่กำลังจะยืนยันยกเลิก (เปิด modal แจ้งเตือนแทน window.confirm)
  const [cancelTarget, setCancelTarget] = useState(null);
  // ออเดอร์ที่กำลังเปิดดูรายละเอียดสินค้า (เปิดจากการคลิกที่แถวในตาราง)
  const [detailOrder, setDetailOrder] = useState(null);
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
  // ดึง users มาพร้อมกันด้วย เพื่อ join รูปโปรไฟล์ลูกค้าผ่าน userId
  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const ordersData = await api.get("/api/orders");
      const ordersList = Array.isArray(ordersData) ? ordersData : ordersData.orders || [];
      setOrders(ordersList);

      // ดึงเฉพาะ user ที่มีอยู่ในออเดอร์จริงๆ ทีละคนผ่าน /api/users/:id (ไม่ดึง list ทั้งหมด)
      // เพื่อเลี่ยงปัญหาสิทธิ์เข้าถึง และไม่ต้องโหลดข้อมูล user ที่ไม่เกี่ยวข้อง
      const uniqueUserIds = [...new Set(ordersList.map((o) => o.userId).filter(Boolean))];
      const userResults = await Promise.allSettled(
        uniqueUserIds.map((id) => api.get(`/api/users/${id}`))
      );
      const fetchedUsers = userResults
        .filter((r) => r.status === "fulfilled")
        .map((r) => (r.value?.user ? r.value.user : r.value));
      setUsers(fetchedUsers);
    } catch (err) {
      setError(err.message || "โหลดคำสั่งซื้อไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // lookup map จาก userId -> avatar เพื่อใช้แสดงรูปโปรไฟล์ลูกค้าในตาราง
  const userAvatarMap = useMemo(() => {
    const map = {};
    for (const u of users) {
      map[u.id] = u.avatar;
    }
    return map;
  }, [users]);

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
    const pendingValue = pending.reduce((sum, o) => sum + (o.total || 0), 0);
    return [
      { label: "รอการอนุมัติ", value: String(pending.length) },
      { label: "มูลค่ารวม (รอตรวจสอบ)", value: `฿${pendingValue.toLocaleString()}` },
      { label: "คำสั่งซื้อทั้งหมด", value: String(orders.length) },
    ];
  }, [orders]);

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

      // แจ้งเตือนลูกค้าเมื่อคำสั่งซื้อถูกยกเลิก (กรณีพนักงานอนุมัติไปแล้วแต่มายกเลิกทีหลัง)
      // หา snapshot ของออเดอร์จาก state เดิม (ก่อนอัปเดต) ไว้ใช้แสดงยอดเงินในข้อความแจ้งเตือน
      if (status === "cancelled") {
        const orderInfo = orders.find((o) => o.id === orderId);
        addNotification({
          type: "order",
          title: `คำสั่งซื้อ ${orderId} ถูกยกเลิก`,
          message: `คำสั่งซื้อมูลค่า ฿${(orderInfo?.total || 0).toLocaleString()} ของคุณถูกยกเลิกโดยเจ้าหน้าที่ หากมีข้อสงสัยกรุณาติดต่อร้านค้า`,
        }).catch(() => {
          /* แจ้งเตือนล้มเหลวไม่ควรทำให้การยกเลิกออเดอร์ที่สำเร็จแล้วดูเหมือนพัง */
        });
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
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                  <tr
                    key={o.id}
                    onClick={() => setDetailOrder(o)}
                    className="cursor-pointer border-b border-slate-50 last:border-0 hover:bg-slate-50/70"
                  >
                    <td className="px-6 py-4 font-medium text-slate-800">{o.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getCustomerAvatar(o, userAvatarMap)}
                          alt=""
                          onError={(e) => {
                            // ถ้ารูปโหลดไม่ขึ้น (เช่น URL localhost dev ที่ใช้ไม่ได้แล้ว) ให้ fallback เป็น
                            // placeholder ที่ seed คงที่ตาม userId/orderId แทน (ไม่ใช้ placeholder แบบสุ่ม
                            // เพราะจะทำให้รูปเปลี่ยนไปเรื่อยๆ ทุกครั้งที่ re-render/รีเฟรช)
                            const fallback = getFallbackAvatar(o.userId ?? o.id);
                            if (e.currentTarget.src !== fallback) {
                              e.currentTarget.src = fallback;
                            }
                          }}
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
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
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

      {/* Modal รายละเอียดคำสั่งซื้อ (เปิดจากการคลิกแถวในตาราง) */}
      {detailOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
          onClick={() => setDetailOrder(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">{detailOrder.id}</h2>
                <p className="mt-0.5 text-sm text-slate-400">
                  {detailOrder.customer || `User #${detailOrder.userId}`}
                  {detailOrder.date ? ` · ${detailOrder.date}` : ""}
                </p>
              </div>
              <button
                type="button"
                aria-label="ปิด"
                onClick={() => setDetailOrder(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-6 py-4">
              <p className="mb-2 text-sm font-medium text-slate-600">รายการสินค้า</p>
              <div className="divide-y divide-slate-50 rounded-xl border border-slate-100">
                {(detailOrder.items || []).length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-slate-400">
                    ไม่มีรายการสินค้าในคำสั่งซื้อนี้
                  </p>
                ) : (
                  detailOrder.items.map((item, idx) => (
                    <div key={item.productId || idx} className="flex items-center gap-3 px-4 py-3">
                      <img
                        src={item.image || getFallbackAvatar(item.productId ?? idx)}
                        alt=""
                        onError={(e) => {
                          const fallback = getFallbackAvatar(item.productId ?? idx);
                          if (e.currentTarget.src !== fallback) {
                            e.currentTarget.src = fallback;
                          }
                        }}
                        className="h-11 w-11 shrink-0 rounded-lg border border-slate-100 object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-800">
                          {item.name || item.productId}
                        </p>
                        <p className="text-xs text-slate-400">
                          {item.quantity} x ฿{Number(item.price || 0).toLocaleString()}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-medium text-slate-700">
                        ฿
                        {(Number(item.price || 0) * Number(item.quantity || 0)).toLocaleString(
                          undefined,
                          { minimumFractionDigits: 2 }
                        )}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 space-y-2 rounded-xl border border-slate-100 px-4 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">ที่อยู่จัดส่ง</span>
                  <span className="max-w-[65%] text-right text-slate-700">
                    {detailOrder.address || "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">ช่องทางชำระเงิน</span>
                  <span className="text-slate-700">
                    {PAYMENT_LABELS[detailOrder.paymentMethod] || detailOrder.paymentMethod || "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">วิธีจัดส่ง</span>
                  <span className="text-slate-700">
                    {DELIVERY_LABELS[detailOrder.deliveryMethod] || "จัดส่งมาตรฐาน (3-5 วันทำการ)"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-base">
                  <span className="font-medium text-slate-600">ยอดรวมทั้งหมด</span>
                  <span className="font-semibold text-emerald-700">
                    ฿{(detailOrder.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
              <button
                type="button"
                onClick={() => setDetailOrder(null)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}