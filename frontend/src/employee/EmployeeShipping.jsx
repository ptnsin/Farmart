import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Bell,
  Truck,
  ClipboardList,
  CircleCheck,
  AlertTriangle,
  Filter,
  Eye,
  FileText,
  Map,
  X,
  ChevronLeft,
  ChevronRight,
  Printer,
} from "lucide-react";
import EmployeeSidebar from "./EmployeeSidebar";
import { getCachedUser, fetchCurrentUser } from "../data/authStore";
import { api } from "../data/apiClient";

// สถานะจริงจาก backend: preparing | in_transit | delivered
// "delayed" ไม่มีใน backend เลย เราคำนวณเองจาก eta ที่เลยกำหนดแล้วแต่ยังไม่ delivered
const SHIPMENT_STATUS_STYLES = {
  preparing: { bg: "bg-sky-50", text: "text-sky-600", label: "รอนำจ่าย" },
  in_transit: { bg: "bg-emerald-50", text: "text-emerald-600", label: "กำลังจัดส่ง" },
  delivered: { bg: "bg-emerald-50", text: "text-emerald-600", label: "ส่งสำเร็จ" },
  delayed: { bg: "bg-rose-50", text: "text-rose-500", label: "ล่าช้า" },
};

const STATUS_FILTERS = [
  { value: "all", label: "ทั้งหมด" },
  { value: "preparing", label: "รอนำจ่าย" },
  { value: "in_transit", label: "กำลังจัดส่ง" },
  { value: "delivered", label: "ส่งสำเร็จ" },
  { value: "delayed", label: "ล่าช้า" },
];

const PAGE_SIZE = 8;

function isEtaPast(eta) {
  if (!eta) return false;
  const d = new Date(eta);
  if (Number.isNaN(d.getTime())) return false;
  return d.getTime() < Date.now();
}

/** shipment.status ดิบจาก backend + คำนวณ "ล่าช้า" เพิ่มเอง ถ้า eta เลยกำหนดแล้วแต่ยังไม่ delivered */
function getDisplayStatus(shipment) {
  if (shipment.status !== "delivered" && isEtaPast(shipment.eta)) return "delayed";
  return shipment.status;
}

function formatAddress(address) {
  if (!address) return "-";
  if (typeof address === "string") return address;
  const parts = [address.line1, address.district, address.province, address.zipcode].filter(Boolean);
  return parts.length ? parts.join(" ") : "-";
}

function formatEta(eta) {
  if (!eta) return null;
  const d = new Date(eta);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
}

function formatDateTime(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("th-TH", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function StatCard({ label, value, note, icon: Icon, iconBg, iconColor, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border bg-white p-5 text-left shadow-sm transition ${
        active ? "border-emerald-400 ring-2 ring-emerald-100" : "border-slate-100 hover:border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{label}</p>
        <div className={`flex h-9 w-9 items-center justify-center rounded-full ${iconBg} ${iconColor}`}>
          <Icon size={16} />
        </div>
      </div>
      <p className="mt-2 text-2xl font-semibold text-slate-800">{value}</p>
      <p className="mt-1 text-xs font-medium text-slate-400">{note}</p>
    </button>
  );
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className={`max-h-[85vh] w-full ${wide ? "max-w-2xl" : "max-w-md"} overflow-y-auto rounded-xl bg-white shadow-xl`}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="ปิด">
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

export default function EmployeeShipping() {
  const [user, setUser] = useState(getCachedUser());
  const [query, setQuery] = useState("");

  const [shipments, setShipments] = useState([]);
  const [ordersById, setOrdersById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // couriers: null = ยังไม่รู้ผล/ไม่มีสิทธิ์เข้าถึง (ซ่อน section เงียบ ๆ), array = โหลดสำเร็จ
  const [couriers, setCouriers] = useState(null);

  // --- UI state for interactive controls ---
  const [statusFilter, setStatusFilter] = useState("all");
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [detailShipment, setDetailShipment] = useState(null); // Eye button
  const [waybillShipment, setWaybillShipment] = useState(null); // FileText button
  const [showMapModal, setShowMapModal] = useState(false);
  const [showAllCouriers, setShowAllCouriers] = useState(false);
  const filterMenuRef = useRef(null);

  useEffect(() => {
    fetchCurrentUser().then(setUser).catch(() => {});
  }, []);

  // ปิดเมนู filter เมื่อคลิกนอกกล่อง (เดิมกดที่อื่นแล้วเมนูค้าง ต้องกดปุ่ม filter ซ้ำเพื่อปิด)
  useEffect(() => {
    if (!filterMenuOpen) return;
    function handleClickOutside(e) {
      if (filterMenuRef.current && !filterMenuRef.current.contains(e.target)) {
        setFilterMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [filterMenuOpen]);

  // โหลดรายการจัดส่ง แล้ว join ข้อมูลลูกค้า/ปลายทางจาก order ที่ผูกอยู่
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await api.get("/api/shipments");
        const list = data?.shipments || [];
        if (cancelled) return;
        setShipments(list);

        const orderIds = [...new Set(list.map((s) => s.order).filter(Boolean))];
        const entries = await Promise.all(
          orderIds.map(async (id) => {
            try {
              const res = await api.get(`/api/orders/${id}`);
              return [id, res.order];
            } catch {
              // ดึงรายละเอียดคำสั่งซื้อไม่ได้ (เช่น order ถูกลบไปแล้ว) ไม่ให้ทั้งหน้าพัง
              return [id, null];
            }
          })
        );
        if (cancelled) return;
        setOrdersById(Object.fromEntries(entries));
      } catch (err) {
        if (!cancelled) setError(err.message || "โหลดข้อมูลการจัดส่งไม่สำเร็จ");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // /api/users เป็น ADMIN-only — ถ้า employee เรียกแล้วโดน 403 ให้ซ่อน section เงียบ ๆ
  useEffect(() => {
    let cancelled = false;
    api
      .get("/api/users?role=EMPLOYEE")
      .then((data) => {
        if (cancelled) return;
        const list = (data?.users || []).filter((u) => !u.role || u.role === "EMPLOYEE");
        setCouriers(list);
      })
      .catch(() => {
        if (!cancelled) setCouriers(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const enrichedShipments = useMemo(
    () =>
      shipments.map((s) => ({
        ...s,
        displayStatus: getDisplayStatus(s),
        orderInfo: ordersById[s.order] || null,
      })),
    [shipments, ordersById]
  );

  const searchedShipments = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return enrichedShipments;
    return enrichedShipments.filter(
      (s) =>
        s.id?.toLowerCase().includes(q) ||
        s.orderInfo?.customer?.toLowerCase().includes(q) ||
        s.order?.toLowerCase?.().includes(q)
    );
  }, [enrichedShipments, query]);

  const filteredShipments = useMemo(() => {
    if (statusFilter === "all") return searchedShipments;
    return searchedShipments.filter((s) => s.displayStatus === statusFilter);
  }, [searchedShipments, statusFilter]);

  // reset ไปหน้า 1 ทุกครั้งที่ search/filter เปลี่ยน จะได้ไม่ค้างอยู่หน้าที่ไม่มีข้อมูล
  useEffect(() => {
    setPage(1);
  }, [query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredShipments.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedShipments = filteredShipments.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const statusCounts = enrichedShipments.reduce((acc, s) => {
    acc[s.displayStatus] = (acc[s.displayStatus] || 0) + 1;
    return acc;
  }, {});

  const totalNote = `จากทั้งหมด ${shipments.length} รายการ`;
  const STATS = [
    { key: "in_transit", label: "กำลังจัดส่ง", value: statusCounts.in_transit || 0, note: totalNote, icon: Truck, iconBg: "bg-sky-50", iconColor: "text-sky-600" },
    { key: "preparing", label: "รอนำจ่าย", value: statusCounts.preparing || 0, note: totalNote, icon: ClipboardList, iconBg: "bg-amber-50", iconColor: "text-amber-600" },
    { key: "delivered", label: "ส่งสำเร็จ", value: statusCounts.delivered || 0, note: totalNote, icon: CircleCheck, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
    { key: "delayed", label: "ล่าช้า", value: statusCounts.delayed || 0, note: "คำนวณจากกำหนดส่งที่เลยแล้ว", icon: AlertTriangle, iconBg: "bg-rose-50", iconColor: "text-rose-500" },
  ];

  const visibleCouriers = couriers ? (showAllCouriers ? couriers : couriers.slice(0, 3)) : [];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <EmployeeSidebar active="shipping" />

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
              placeholder="ค้นหารหัสการจัดส่ง หรือชื่อลูกค้า"
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

        {/* Heading */}
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">จัดการการขนส่ง</h1>
          <p className="mt-1 text-sm text-slate-400">
            ภาพรวมสถานะการจัดส่งสินค้าเกษตรและเส้นทางการกระจายสินค้า
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {error}
          </div>
        )}

        {/* Stats — clicking a card filters the table by that status */}
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STATS.map((s) => (
            <StatCard
              key={s.key}
              {...s}
              active={statusFilter === s.key}
              onClick={() => setStatusFilter((prev) => (prev === s.key ? "all" : s.key))}
            />
          ))}
        </div>

        {/* Content: table + right rail */}
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Shipments table */}
          <div className="overflow-hidden rounded-xl border border-slate-100 bg-white xl:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-sm font-semibold text-slate-800">
                รายการจัดส่งล่าสุด
                {statusFilter !== "all" && (
                  <span className="ml-2 text-xs font-normal text-emerald-600">
                    (กรอง: {STATUS_FILTERS.find((f) => f.value === statusFilter)?.label})
                  </span>
                )}
              </h2>
              <div className="relative" ref={filterMenuRef}>
                <button
                  type="button"
                  aria-label="ตัวกรอง"
                  onClick={() => setFilterMenuOpen((v) => !v)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border text-slate-500 hover:bg-slate-50 ${
                    statusFilter !== "all" ? "border-emerald-400 text-emerald-600" : "border-slate-200"
                  }`}
                >
                  <Filter size={14} />
                </button>
                {filterMenuOpen && (
                  <div className="absolute right-0 z-10 mt-2 w-40 rounded-lg border border-slate-100 bg-white py-1 shadow-lg">
                    {STATUS_FILTERS.map((f) => (
                      <button
                        key={f.value}
                        type="button"
                        onClick={() => {
                          setStatusFilter(f.value);
                          setFilterMenuOpen(false);
                        }}
                        className={`block w-full px-3 py-1.5 text-left text-xs hover:bg-slate-50 ${
                          statusFilter === f.value ? "font-semibold text-emerald-600" : "text-slate-600"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {loading ? (
              <div className="px-6 py-10 text-center text-sm text-slate-400">กำลังโหลดข้อมูล...</div>
            ) : pagedShipments.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-slate-400">ไม่พบรายการจัดส่ง</div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs text-slate-400">
                    <th className="px-6 py-3 font-medium">รหัสการจัดส่ง</th>
                    <th className="px-6 py-3 font-medium">ข้อมูลลูกค้า</th>
                    <th className="px-6 py-3 font-medium">ปลายทาง</th>
                    <th className="px-6 py-3 font-medium">ผู้ให้บริการขนส่ง</th>
                    <th className="px-6 py-3 font-medium">สถานะ</th>
                    <th className="px-6 py-3 text-right font-medium">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedShipments.map((s) => {
                    const status = SHIPMENT_STATUS_STYLES[s.displayStatus] || SHIPMENT_STATUS_STYLES.preparing;
                    const eta = formatEta(s.eta);
                    return (
                      <tr key={s.id} className="border-b border-slate-50 last:border-0">
                        <td className="px-6 py-3.5 font-medium text-slate-800">
                          {s.id}
                          {eta && <p className="mt-0.5 text-xs font-normal text-slate-400">กำหนดส่ง: {eta}</p>}
                        </td>
                        <td className="px-6 py-3.5">
                          <p className="font-medium text-slate-800">{s.orderInfo?.customer || "ไม่พบข้อมูลลูกค้า"}</p>
                          <p className="text-xs text-slate-400">อ้างอิงคำสั่งซื้อ: {s.order}</p>
                        </td>
                        <td className="px-6 py-3.5 text-slate-600">{formatAddress(s.orderInfo?.address)}</td>
                        <td className="px-6 py-3.5 text-slate-600">{s.carrier || "-"}</td>
                        <td className="px-6 py-3.5">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${status.bg} ${status.text}`}
                          >
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="flex items-center justify-end gap-3 text-slate-400">
                            <button
                              type="button"
                              aria-label="ดูรายละเอียด"
                              onClick={() => setDetailShipment(s)}
                              className="hover:text-slate-600"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              type="button"
                              aria-label="ดูใบงาน"
                              onClick={() => setWaybillShipment(s)}
                              className="hover:text-slate-600"
                            >
                              <FileText size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {!loading && filteredShipments.length > 0 && (
              <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3.5">
                <p className="text-sm text-slate-400">
                  แสดง {(currentPage - 1) * PAGE_SIZE + 1}-
                  {Math.min(currentPage * PAGE_SIZE, filteredShipments.length)} จาก {filteredShipments.length} รายการ
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="ก่อนหน้า"
                    disabled={currentPage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-50 disabled:opacity-30"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPage(n)}
                      className={`flex h-7 w-7 items-center justify-center rounded-md text-sm font-medium ${
                        n === currentPage ? "bg-emerald-600 text-white" : "text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    type="button"
                    aria-label="ถัดไป"
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-50 disabled:opacity-30"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right rail */}
          <div className="space-y-6">
            {/* Real-time map */}
            <div className="overflow-hidden rounded-xl border border-slate-100 bg-white">
              <div className="flex items-center justify-between px-5 pt-5">
                <h2 className="text-sm font-semibold text-slate-800">
                  สถานะการขนส่งแบบ Real-time
                </h2>
                <button
                  type="button"
                  onClick={() => setShowMapModal(true)}
                  className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:underline"
                >
                  <Map size={12} />
                  ดูแผนที่เต็ม
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowMapModal(true)}
                className="relative mx-5 mt-3 mb-5 block h-36 w-[calc(100%-2.5rem)] overflow-hidden rounded-lg bg-gradient-to-br from-emerald-50 to-sky-50"
              >
                <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,theme(colors.slate.300)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.slate.300)_1px,transparent_1px)] [background-size:16px_16px]" />
                <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-emerald-600 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {statusCounts.in_transit || 0} Active Deliveries
                </span>
              </button>
            </div>

            {/* Couriers — ซ่อนเงียบ ๆ ถ้า role ปัจจุบันไม่มีสิทธิ์เรียก /api/users (ADMIN-only) */}
            {couriers && couriers.length > 0 && (
              <div className="rounded-xl border border-slate-100 bg-white p-5">
                <h2 className="text-sm font-semibold text-slate-800">พนักงานส่งสินค้า</h2>
                <div className="mt-4 space-y-4">
                  {visibleCouriers.map((c) => (
                    <div key={c.id || c.email} className="flex items-center gap-3">
                      <img
                        src={c.avatar || "https://i.pravatar.cc/64?img=15"}
                        alt=""
                        className="h-9 w-9 rounded-full object-cover"
                      />
                      <div className="flex-1 leading-tight">
                        <p className="text-sm font-medium text-slate-800">{c.name}</p>
                        <p className="text-xs text-slate-400">{c.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {couriers.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setShowAllCouriers((v) => !v)}
                    className="mt-4 w-full rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    {showAllCouriers ? "แสดงน้อยลง" : `ดูพนักงานทั้งหมด (${couriers.length})`}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Detail modal (Eye button) */}
      {detailShipment && (
        <Modal title={`รายละเอียดการจัดส่ง ${detailShipment.id}`} onClose={() => setDetailShipment(null)}>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-400">ลูกค้า</dt>
              <dd className="text-right font-medium text-slate-800">
                {detailShipment.orderInfo?.customer || "ไม่พบข้อมูลลูกค้า"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-400">อ้างอิงคำสั่งซื้อ</dt>
              <dd className="text-right font-medium text-slate-800">{detailShipment.order || "-"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-400">ปลายทาง</dt>
              <dd className="text-right font-medium text-slate-800">
                {formatAddress(detailShipment.orderInfo?.address)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-400">ผู้ให้บริการขนส่ง</dt>
              <dd className="text-right font-medium text-slate-800">{detailShipment.carrier || "-"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-400">กำหนดส่ง (ETA)</dt>
              <dd className="text-right font-medium text-slate-800">{formatEta(detailShipment.eta) || "-"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-400">สถานะ</dt>
              <dd>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                    (SHIPMENT_STATUS_STYLES[detailShipment.displayStatus] || SHIPMENT_STATUS_STYLES.preparing).bg
                  } ${(SHIPMENT_STATUS_STYLES[detailShipment.displayStatus] || SHIPMENT_STATUS_STYLES.preparing).text}`}
                >
                  {(SHIPMENT_STATUS_STYLES[detailShipment.displayStatus] || SHIPMENT_STATUS_STYLES.preparing).label}
                </span>
              </dd>
            </div>
          </dl>
        </Modal>
      )}

      {/* Waybill modal (FileText button) */}
      {waybillShipment && (
        <Modal title="ใบงานจัดส่ง" onClose={() => setWaybillShipment(null)} wide>
          <div id="waybill-print-area" className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-slate-800">ใบงานจัดส่ง #{waybillShipment.id}</p>
                <p className="text-xs text-slate-400">พิมพ์เมื่อ {formatDateTime(new Date())}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 rounded-lg border border-slate-100 p-4">
              <div>
                <p className="text-xs text-slate-400">ลูกค้า</p>
                <p className="font-medium text-slate-800">{waybillShipment.orderInfo?.customer || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">อ้างอิงคำสั่งซื้อ</p>
                <p className="font-medium text-slate-800">{waybillShipment.order || "-"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-slate-400">ที่อยู่จัดส่ง</p>
                <p className="font-medium text-slate-800">{formatAddress(waybillShipment.orderInfo?.address)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">ผู้ให้บริการขนส่ง</p>
                <p className="font-medium text-slate-800">{waybillShipment.carrier || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">กำหนดส่ง</p>
                <p className="font-medium text-slate-800">{formatEta(waybillShipment.eta) || "-"}</p>
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700"
            >
              <Printer size={14} />
              พิมพ์ใบงาน
            </button>
          </div>
          {/* จำกัดขอบเขตการพิมพ์ให้เหลือแค่ใบงาน ไม่พิมพ์ทั้งหน้า/พื้นหลัง modal */}
          <style>{`
            @media print {
              body * { visibility: hidden; }
              #waybill-print-area, #waybill-print-area * { visibility: visible; }
              #waybill-print-area {
                position: fixed;
                inset: 0;
                width: 100%;
                padding: 24px;
              }
            }
          `}</style>
        </Modal>
      )}

      {/* Map modal */}
      {showMapModal && (
        <Modal title="แผนที่การจัดส่งแบบ Real-time" onClose={() => setShowMapModal(false)} wide>
          <div className="relative h-80 overflow-hidden rounded-lg bg-gradient-to-br from-emerald-50 to-sky-50">
            <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,theme(colors.slate.300)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.slate.300)_1px,transparent_1px)] [background-size:16px_16px]" />
            <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-emerald-600 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {statusCounts.in_transit || 0} Active Deliveries
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            หมายเหตุ: ยังไม่มี endpoint พิกัด GPS จาก backend — เมื่อพร้อมใช้งานสามารถต่อ marker จริงลงในแผนที่นี้ได้
          </p>
        </Modal>
      )}
    </div>
  );
  
// /api/users เป็น ADMIN-only เท่านั้น (ดู backend/routes/users.js: requireRole("ADMIN"))
  // เดิมยิง request นี้ทุกครั้งไม่ว่า role อะไร ทำให้ employee โดน 403 รับประกันทุกครั้งที่เข้าหน้านี้
  // เช็ค role ก่อนที่ client เลย ไม่ต้องเสีย request ที่รู้อยู่แล้วว่าพังแน่ๆ
  useEffect(() => {
    if (user?.role !== "ADMIN") {
      setCouriers(null);
      return;
    }
    let cancelled = false;
    api
      .get("/api/users?role=EMPLOYEE")
      .then((data) => {
        if (cancelled) return;
        const list = (data?.users || []).filter((u) => !u.role || u.role === "EMPLOYEE");
        setCouriers(list);
      })
      .catch(() => {
        if (!cancelled) setCouriers(null);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);
}