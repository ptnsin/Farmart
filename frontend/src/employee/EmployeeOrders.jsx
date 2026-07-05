import { useMemo, useState } from "react";
import {
  Search,
  HelpCircle,
  Eye,
  Check,
  X,
  ChevronDown,
  AlertTriangle,
  CircleCheck,
  CircleX,
} from "lucide-react";
import EmployeeSidebar from "./EmployeeSidebar";

const STATUS_STYLES = {
  pending: { dot: "bg-amber-500", text: "text-amber-600", label: "รอดำเนินการ" },
  approved: { dot: "bg-emerald-500", text: "text-emerald-600", label: "อนุมัติแล้ว" },
  rejected: { dot: "bg-rose-500", text: "text-rose-500", label: "ปฏิเสธแล้ว" },
};

const INITIAL_ORDERS = [
  {
    id: "ORD-10231",
    customer: "กัญญา วนาวรรณ",
    items: "ข้าวหอมมะลิ x 20 กก.",
    total: 2400,
    date: "3 ก.ค. 2569",
    status: "pending",
  },
  {
    id: "ORD-10230",
    customer: "ธนาชัย นรินทร์",
    items: "มะม่วงน้ำดอกไม้ x 5 กก.",
    total: 750,
    date: "3 ก.ค. 2569",
    status: "pending",
  },
  {
    id: "ORD-10229",
    customer: "วิไลลักษณ์ แสงดาว",
    items: "ผักกาดขาว x 10 กก.",
    total: 450,
    date: "2 ก.ค. 2569",
    status: "approved",
  },
  {
    id: "ORD-10228",
    customer: "สมบัติ พืชผล",
    items: "ไข่ไก่เบอร์ 0 x 3 แผง",
    total: 315,
    date: "2 ก.ค. 2569",
    status: "approved",
  },
  {
    id: "ORD-10227",
    customer: "อนุพงษ์ ศรีสุข",
    items: "ทุเรียนหมอนทอง x 2 ลูก",
    total: 1200,
    date: "1 ก.ค. 2569",
    status: "rejected",
  },
];

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

export default function EmployeeOrders() {
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);

  const stats = useMemo(() => {
    const pending = orders.filter((o) => o.status === "pending").length;
    const approved = orders.filter((o) => o.status === "approved").length;
    const rejected = orders.filter((o) => o.status === "rejected").length;
    return { pending, approved, rejected };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesFilter = filter === "all" || o.status === filter;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q || o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [orders, filter, query]);

  const setStatus = (id, status) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const FILTERS = [
    { key: "all", label: "ทั้งหมด" },
    { key: "pending", label: "รอดำเนินการ" },
    { key: "approved", label: "อนุมัติแล้ว" },
    { key: "rejected", label: "ปฏิเสธแล้ว" },
  ];

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
              placeholder="ค้นหาคำสั่งซื้อด้วยรหัสหรือชื่อลูกค้า..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <button
            type="button"
            aria-label="ช่วยเหลือ"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:bg-slate-50"
          >
            <HelpCircle size={18} />
          </button>
          <div className="flex items-center gap-3 rounded-full border border-slate-200 py-1.5 pl-1.5 pr-4">
            <img
              src="https://i.pravatar.cc/64?img=5"
              alt=""
              className="h-8 w-8 rounded-full object-cover"
            />
            <div className="leading-tight">
              <p className="text-sm font-medium text-slate-800">พนักงาน</p>
              <p className="text-xs text-slate-400">Warehouse Staff</p>
            </div>
          </div>
        </div>

        {/* Heading */}
        <div>
          <h1 className="text-2xl font-semibold text-emerald-800">หน้าคำสั่งซื้อ</h1>
          <p className="mt-1 text-sm text-slate-400">
            ตรวจสอบและอนุมัติคำสั่งซื้อที่เข้ามาในระบบ Farmart
          </p>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="รอดำเนินการ"
            value={stats.pending}
            note="ที่ยังไม่ได้อนุมัติ"
            icon={AlertTriangle}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
          />
          <StatCard
            label="อนุมัติแล้ว"
            value={stats.approved}
            note="พร้อมเข้าสู่ขั้นตอนจัดส่ง"
            icon={CircleCheck}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
          />
          <StatCard
            label="ปฏิเสธแล้ว"
            value={stats.rejected}
            note="ไม่ผ่านการอนุมัติ"
            icon={CircleX}
            iconBg="bg-rose-50"
            iconColor="text-rose-500"
          />
        </div>

        {/* Filter row */}
        <div className="mt-8 flex items-center justify-between">
          <div className="relative flex items-center gap-2 text-sm text-slate-500">
            <span>ตัวกรองรายการ:</span>
            <button
              type="button"
              onClick={() => setFilterOpen((v) => !v)}
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700"
            >
              {FILTERS.find((f) => f.key === filter)?.label}
              <ChevronDown size={14} />
            </button>
            {filterOpen && (
              <div className="absolute left-24 top-9 z-10 w-40 rounded-lg border border-slate-100 bg-white py-1 shadow-lg">
                {FILTERS.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => {
                      setFilter(f.key);
                      setFilterOpen(false);
                    }}
                    className="block w-full px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50"
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="text-sm text-slate-400">
            แสดงผล {filteredOrders.length} จาก {orders.length} รายการ
          </p>
        </div>

        {/* Table */}
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-100 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-400">
                <th className="px-6 py-3 font-medium">รหัสคำสั่งซื้อ</th>
                <th className="px-6 py-3 font-medium">ลูกค้า</th>
                <th className="px-6 py-3 font-medium">รายการสินค้า</th>
                <th className="px-6 py-3 font-medium">ยอดรวม</th>
                <th className="px-6 py-3 font-medium">วันที่สั่งซื้อ</th>
                <th className="px-6 py-3 font-medium">สถานะ</th>
                <th className="px-6 py-3 text-right font-medium">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => {
                const status = STATUS_STYLES[o.status];
                return (
                  <tr key={o.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-6 py-3.5 font-medium text-slate-800">{o.id}</td>
                    <td className="px-6 py-3.5 text-slate-600">{o.customer}</td>
                    <td className="px-6 py-3.5 text-slate-600">{o.items}</td>
                    <td className="px-6 py-3.5 font-medium text-slate-800">
                      ฿{o.total.toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5 text-slate-500">{o.date}</td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs ${status.text}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center justify-end gap-3 text-slate-400">
                        <button type="button" aria-label="ดูรายละเอียด" className="hover:text-slate-600">
                          <Eye size={16} />
                        </button>
                        {o.status === "pending" && (
                          <>
                            <button
                              type="button"
                              aria-label="อนุมัติคำสั่งซื้อ"
                              onClick={() => setStatus(o.id, "approved")}
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              type="button"
                              aria-label="ปฏิเสธคำสั่งซื้อ"
                              onClick={() => setStatus(o.id, "rejected")}
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100"
                            >
                              <X size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-400">
                    ไม่พบคำสั่งซื้อที่ตรงกับเงื่อนไข
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}