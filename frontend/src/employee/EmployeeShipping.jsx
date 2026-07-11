import { useState } from "react";
import {
  Search,
  Bell,
  Settings,
  Truck,
  ClipboardList,
  CircleCheck,
  AlertTriangle,
  Filter,
  Eye,
  FileText,
  Map,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import EmployeeSidebar from "./Employeesidebar";

const STATUS_STYLES = {
  shipping: { bg: "bg-emerald-50", text: "text-emerald-600", label: "กำลังจัดส่ง" },
  out_for_delivery: { bg: "bg-sky-50", text: "text-sky-600", label: "รอนำจ่าย" },
  delivered: { bg: "bg-emerald-50", text: "text-emerald-600", label: "ส่งสำเร็จ" },
  delayed: { bg: "bg-rose-50", text: "text-rose-500", label: "ล่าช้า" },
};

const STATS = [
  {
    label: "กำลังจัดส่ง",
    value: "45",
    note: "+5% จากเมื่อวาน",
    trend: "up",
    icon: Truck,
    iconBg: "bg-sky-50",
    iconColor: "text-sky-600",
  },
  {
    label: "รอนำจ่าย",
    value: "12",
    note: "-2% จากเมื่อวาน",
    trend: "down",
    icon: ClipboardList,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    label: "ส่งสำเร็จวันนี้",
    value: "128",
    note: "+10% สูงสุดรอบปีนี้",
    trend: "up",
    icon: CircleCheck,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    label: "ล่าช้า",
    value: "3",
    note: "คงที่จากเมื่อวาน",
    trend: "flat",
    icon: AlertTriangle,
    iconBg: "bg-rose-50",
    iconColor: "text-rose-500",
  },
];

const ORDERS = [
  {
    id: "#AG-8821",
    customer: "สมชาย รักดี",
    phone: "081-234-XXXX",
    destination: "กรุงเทพมหานคร",
    method: "ควบคุมอุณหภูมิ",
    status: "shipping",
  },
  {
    id: "#AG-8822",
    customer: "กัญญา สมชื่อ",
    phone: "092-887-XXXX",
    destination: "เชียงใหม่",
    method: "รถบรรทุก 6 ล้อ",
    status: "out_for_delivery",
  },
  {
    id: "#AG-8823",
    customer: "วิชัย มีสุข",
    phone: "084-556-XXXX",
    destination: "ขอนแก่น",
    method: "จัดส่งด่วนพิเศษ",
    status: "delivered",
  },
  {
    id: "#AG-8824",
    customer: "ศรี ลักษณ์ควดี",
    phone: "089-112-XXXX",
    destination: "ภูเก็ต",
    method: "ควบคุมอุณหภูมิ",
    status: "delayed",
  },
];

const COURIERS = [
  { name: "เกียรติศักดิ์ มั่นคง", route: "กรุงเทพฯ - ตะวันตก", jobs: 5, avatar: "https://i.pravatar.cc/64?img=15" },
  { name: "สุนิสา แซ่ตั้ง", route: "เชียงใหม่ - เหนือ", jobs: 2, avatar: "https://i.pravatar.cc/64?img=25" },
  { name: "มานะ อดทน", route: "นครปฐม - ราชบุรี", jobs: 6, avatar: "https://i.pravatar.cc/64?img=53" },
];

function StatCard({ label, value, note, trend, icon: Icon, iconBg, iconColor }) {
  const trendColor =
    trend === "up" ? "text-emerald-600" : trend === "down" ? "text-rose-500" : "text-slate-400";
  const TrendIcon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : null;

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{label}</p>
        <div className={`flex h-9 w-9 items-center justify-center rounded-full ${iconBg} ${iconColor}`}>
          <Icon size={16} />
        </div>
      </div>
      <p className="mt-2 text-2xl font-semibold text-slate-800">{value}</p>
      <p className={`mt-1 flex items-center gap-1 text-xs font-medium ${trendColor}`}>
        {TrendIcon && <TrendIcon size={12} />}
        {note}
      </p>
    </div>
  );
}

export default function EmployeeShipping() {
  const [query, setQuery] = useState("");

  const filteredOrders = ORDERS.filter((o) => {
    const q = query.trim().toLowerCase();
    return !q || o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q);
  });

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <EmployeeSidebar active="shipping" />

      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-8 py-4">
          <div className="relative w-72">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="ค้นหาข้อมูล..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="แจ้งเตือน"
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-slate-50"
            >
              <Bell size={18} />
            </button>
            <button
              type="button"
              aria-label="ตั้งค่า"
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-slate-50"
            >
              <Settings size={18} />
            </button>
            <img
              src="https://i.pravatar.cc/64?img=47"
              alt=""
              className="ml-1 h-9 w-9 rounded-full object-cover"
            />
          </div>
        </div>

        <div className="px-8 py-6">
          {/* Heading */}
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">จัดการการขนส่ง</h1>
            <p className="mt-1 text-sm text-slate-400">
              ภาพรวมสถานะการจัดส่งสินค้าเกษตรและเส้นทางการกระจายสินค้า
            </p>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {STATS.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>

          {/* Content: table + right rail */}
          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
            {/* Orders table */}
            <div className="overflow-hidden rounded-xl border border-slate-100 bg-white xl:col-span-2">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <h2 className="text-sm font-semibold text-slate-800">รายการคำสั่งซื้อล่าสุด</h2>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search
                      size={14}
                      className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      placeholder="ค้นหารหัส หรือลูกค้า"
                      className="w-44 rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs outline-none placeholder:text-slate-400 focus:border-emerald-400"
                    />
                  </div>
                  <button
                    type="button"
                    aria-label="ตัวกรอง"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                  >
                    <Filter size={14} />
                  </button>
                </div>
              </div>

              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs text-slate-400">
                    <th className="px-6 py-3 font-medium">รหัสคำสั่งซื้อ</th>
                    <th className="px-6 py-3 font-medium">ข้อมูลลูกค้า</th>
                    <th className="px-6 py-3 font-medium">ปลายทาง</th>
                    <th className="px-6 py-3 font-medium">วิธีการส่ง</th>
                    <th className="px-6 py-3 font-medium">สถานะ</th>
                    <th className="px-6 py-3 text-right font-medium">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((o) => {
                    const status = STATUS_STYLES[o.status];
                    return (
                      <tr key={o.id} className="border-b border-slate-50 last:border-0">
                        <td className="px-6 py-3.5 font-medium text-slate-800">{o.id}</td>
                        <td className="px-6 py-3.5">
                          <p className="font-medium text-slate-800">{o.customer}</p>
                          <p className="text-xs text-slate-400">{o.phone}</p>
                        </td>
                        <td className="px-6 py-3.5 text-slate-600">{o.destination}</td>
                        <td className="px-6 py-3.5 text-slate-600">{o.method}</td>
                        <td className="px-6 py-3.5">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${status.bg} ${status.text}`}
                          >
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="flex items-center justify-end gap-3 text-slate-400">
                            <button type="button" aria-label="ดูรายละเอียด" className="hover:text-slate-600">
                              <Eye size={16} />
                            </button>
                            <button type="button" aria-label="ดูใบงาน" className="hover:text-slate-600">
                              <FileText size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3.5">
                <p className="text-sm text-slate-400">แสดง 1 - 4 จาก 45 รายการ</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3].map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`flex h-7 w-7 items-center justify-center rounded-md text-sm font-medium ${
                        n === 1 ? "bg-emerald-600 text-white" : "text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right rail */}
            <div className="space-y-6">
              {/* Real-time map */}
              <div className="overflow-hidden rounded-xl border border-slate-100 bg-white">
                <div className="flex items-center justify-between px-5 pt-5">
                  <h2 className="text-sm font-semibold text-slate-800">
                    สถานะการขนส่งแบบ Real-time
                  </h2>
                  <button type="button" className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:underline">
                    <Map size={12} />
                    ดูแผนที่เต็ม
                  </button>
                </div>
                <div className="relative mx-5 mt-3 mb-5 h-36 overflow-hidden rounded-lg bg-gradient-to-br from-emerald-50 to-sky-50">
                  <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,theme(colors.slate.300)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.slate.300)_1px,transparent_1px)] [background-size:16px_16px]" />
                  <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-emerald-600 shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Active Deliveries
                  </span>
                </div>
              </div>

              {/* Couriers */}
              <div className="rounded-xl border border-slate-100 bg-white p-5">
                <h2 className="text-sm font-semibold text-slate-800">
                  พนักงานส่งสินค้าและงานที่รับผิดชอบ
                </h2>
                <div className="mt-4 space-y-4">
                  {COURIERS.map((c) => (
                    <div key={c.name} className="flex items-center gap-3">
                      <img
                        src={c.avatar}
                        alt=""
                        className="h-9 w-9 rounded-full object-cover"
                      />
                      <div className="flex-1 leading-tight">
                        <p className="text-sm font-medium text-slate-800">{c.name}</p>
                        <p className="text-xs text-slate-400">{c.route}</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {c.jobs} งาน
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="mt-4 w-full rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  ดูพนักงานทั้งหมด
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}