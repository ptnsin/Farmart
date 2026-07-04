import { useMemo, useState } from "react";
import {
  Search,
  ClipboardList,
  Wallet,
  TrendingUp,
  Receipt,
  Landmark,
  Smartphone,
  Image,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import AdminSidebar from "./AdminSidebar";

const ORDERS = [
  {
    id: "#AH-29402",
    customer: "สมชาย มากมาก",
    amount: 12450.0,
    method: "bank",
    methodLabel: "โอนเงินผ่านธนาคาร",
  },
  {
    id: "#AH-29405",
    customer: "ปิยนุช เกียรติ",
    amount: 3200.0,
    method: "promptpay",
    methodLabel: "พร้อมเพย์",
  },
  {
    id: "#AH-29412",
    customer: "Jane Smith",
    amount: 45800.0,
    method: "bank",
    methodLabel: "โอนเงินผ่านธนาคาร",
  },
];

const METHOD_ICON = {
  bank: Landmark,
  promptpay: Smartphone,
};

const TOTAL_PENDING = 24;
const TOTAL_PAGES = 3;

function StatCard({ label, value, note, noteIcon: NoteIcon, icon: Icon, iconBg, iconColor }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className={`flex h-11 w-11 items-center justify-center rounded-full ${iconBg} ${iconColor}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs font-medium tracking-wide text-slate-400">{label}</p>
        <p className="text-2xl font-semibold text-slate-800">{value}</p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-emerald-600">
          {NoteIcon && <NoteIcon size={12} />}
          {note}
        </p>
      </div>
    </div>
  );
}

export default function AdminOrders() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filteredOrders = useMemo(() => {
    if (!query.trim()) return ORDERS;
    const q = query.trim().toLowerCase();
    return ORDERS.filter(
      (o) => o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar />

      {/* Main content */}
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
              placeholder="ค้นหาเลขคำสั่งซื้อ..."
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
              <p className="text-sm font-medium text-slate-800">Admin</p>
              <p className="text-xs text-slate-400">Logistics Manager</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <StatCard
            label="รอการตรวจสอบ"
            value={TOTAL_PENDING}
            note="+12% จากเมื่อวาน"
            noteIcon={TrendingUp}
            icon={ClipboardList}
            iconBg="bg-slate-100"
            iconColor="text-slate-500"
          />
          <StatCard
            label="ยอดรวมทั้งหมด (วันนี้)"
            value="452,000"
            note="จาก 38 รายการ"
            noteIcon={Receipt}
            icon={Wallet}
            iconBg="bg-slate-100"
            iconColor="text-slate-500"
          />
          <div className="col-span-1 flex flex-col justify-center rounded-xl bg-emerald-800 px-6 py-5 text-white sm:col-span-2">
            <h3 className="text-lg font-semibold">ประสิทธิภาพการจัดการ</h3>
            <p className="mt-1 text-sm text-emerald-100">เวลาเฉลี่ยในการตรวจสอบ: 14 นาที</p>
            <p className="text-sm text-emerald-100">รักษามาตรฐานที่ตั้งไว้!</p>
          </div>
        </div>

        {/* Orders card */}
        <div className="mt-6 rounded-xl border border-slate-100 bg-slate-100/60 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-slate-800">
              รายการคำสั่งซื้อล่าสุดที่รอการชำระเงิน
            </h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={query}
                  onChange={(e) => setPage(1) || setQuery(e.target.value)}
                  type="text"
                  placeholder="ค้นหารหัสคำสั่งซื้อหรือลูกค้า..."
                  className="w-64 rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                <Filter size={14} />
                กรอง
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="mt-4 overflow-hidden rounded-lg border border-slate-100 bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-400">
                  <th className="px-6 py-3 font-medium">รหัสคำสั่งซื้อ</th>
                  <th className="px-6 py-3 font-medium">ลูกค้า</th>
                  <th className="px-6 py-3 font-medium">ยอดรวม</th>
                  <th className="px-6 py-3 font-medium">วิธีการ</th>
                  <th className="px-6 py-3 font-medium">หลักฐานการชำระเงิน</th>
                  <th className="px-6 py-3 text-right font-medium">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const MethodIcon = METHOD_ICON[order.method];
                  return (
                    <tr key={order.id} className="border-b border-slate-50 last:border-0">
                      <td className="px-6 py-3.5 font-medium text-slate-800">{order.id}</td>
                      <td className="px-6 py-3.5 text-slate-600">{order.customer}</td>
                      <td className="px-6 py-3.5 font-medium text-slate-800">
                        ฿{order.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-slate-600">
                          <MethodIcon size={14} className="text-slate-400" />
                          {order.methodLabel}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700"
                        >
                          <Image size={14} />
                          ดูสลิป
                        </button>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-200"
                          >
                            ยืนยัน
                          </button>
                          <button
                            type="button"
                            className="rounded-full border border-rose-200 px-3 py-1 text-xs font-medium text-rose-500 hover:bg-rose-50"
                          >
                            ปฏิเสธ
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-400">
                      ไม่พบคำสั่งซื้อที่ตรงกับคำค้นหา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer row inside card */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-slate-400">
              แสดง {filteredOrders.length} จาก {TOTAL_PENDING} รายการที่รอตรวจสอบ
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft size={14} />
              </button>
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${
                    page === n
                      ? "bg-emerald-600 font-medium text-white"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(TOTAL_PAGES, p + 1))}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 hover:bg-slate-50"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Site footer */}
        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-slate-200 py-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-emerald-700">AgriHarvest Solutions</p>
            <p className="text-xs text-slate-400">
              © 2024 AgriHarvest Agricultural Solutions. สงวนลิขสิทธิ์.
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <a href="/terms" className="hover:text-slate-700">
              เงื่อนไขการใช้บริการ
            </a>
            <a href="/privacy" className="hover:text-slate-700">
              นโยบายความเป็นส่วนตัว
            </a>
            <a href="/support" className="hover:text-slate-700">
              ติดต่อฝ่ายสนับสนุน
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}