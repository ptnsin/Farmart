import { useState } from "react";
import { Search, Bell, Truck, CircleCheck, Eye } from "lucide-react";
import EmployeeSidebar from "./EmployeeSidebar";

const STATUS_STYLES = {
  preparing: { dot: "bg-slate-400", text: "text-slate-500", label: "กำลังเตรียมพัสดุ" },
  in_transit: { dot: "bg-amber-500", text: "text-amber-600", label: "อยู่ระหว่างขนส่ง" },
  delivered: { dot: "bg-emerald-500", text: "text-emerald-600", label: "จัดส่งสำเร็จ" },
};

const NEXT_STATUS = { preparing: "in_transit", in_transit: "delivered" };

const INITIAL_SHIPMENTS = [
  { id: "SHP-5521", order: "ORD-10229", carrier: "Farmart Express", status: "delivered", eta: "2 ก.ค. 2569" },
  { id: "SHP-5522", order: "ORD-10228", carrier: "Kerry Express", status: "in_transit", eta: "6 ก.ค. 2569" },
  { id: "SHP-5523", order: "ORD-10231", carrier: "Farmart Express", status: "preparing", eta: "8 ก.ค. 2569" },
  { id: "SHP-5524", order: "ORD-10230", carrier: "Flash Express", status: "in_transit", eta: "7 ก.ค. 2569" },
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

export default function EmployeeShipping() {
  const [shipments, setShipments] = useState(INITIAL_SHIPMENTS);
  const [query, setQuery] = useState("");

  const advance = (id) => {
    setShipments((prev) =>
      prev.map((s) => (s.id === id && NEXT_STATUS[s.status] ? { ...s, status: NEXT_STATUS[s.status] } : s))
    );
  };

  const filtered = shipments.filter((s) => {
    const q = query.trim().toLowerCase();
    return !q || s.id.toLowerCase().includes(q) || s.order.toLowerCase().includes(q);
  });

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
              placeholder="ค้นหาพัสดุด้วยรหัสพัสดุหรือคำสั่งซื้อ..."
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
            <img src="https://i.pravatar.cc/64?img=5" alt="" className="h-8 w-8 rounded-full object-cover" />
            <div className="leading-tight">
              <p className="text-sm font-medium text-slate-800">พนักงาน</p>
              <p className="text-xs text-slate-400">Warehouse Staff</p>
            </div>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-semibold text-emerald-800">หน้าการขนส่ง</h1>
          <p className="mt-1 text-sm text-slate-400">
            ติดตามสถานะพัสดุและอัปเดตความคืบหน้าการจัดส่ง
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="กำลังเตรียมพัสดุ"
            value={shipments.filter((s) => s.status === "preparing").length}
            note="รอออกจากคลังสินค้า"
            icon={Truck}
            iconBg="bg-slate-100"
            iconColor="text-slate-500"
          />
          <StatCard
            label="อยู่ระหว่างขนส่ง"
            value={shipments.filter((s) => s.status === "in_transit").length}
            note="กำลังเดินทางไปหาลูกค้า"
            icon={Truck}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
          />
          <StatCard
            label="จัดส่งสำเร็จ"
            value={shipments.filter((s) => s.status === "delivered").length}
            note="ส่งถึงลูกค้าแล้ว"
            icon={CircleCheck}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
          />
        </div>

        <div className="mt-8 flex items-center justify-between">
          <p className="text-sm text-slate-400">
            แสดงผล {filtered.length} จาก {shipments.length} รายการ
          </p>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-100 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-400">
                <th className="px-6 py-3 font-medium">รหัสพัสดุ</th>
                <th className="px-6 py-3 font-medium">คำสั่งซื้อ</th>
                <th className="px-6 py-3 font-medium">ผู้ขนส่ง</th>
                <th className="px-6 py-3 font-medium">กำหนดส่งโดยประมาณ</th>
                <th className="px-6 py-3 font-medium">สถานะ</th>
                <th className="px-6 py-3 text-right font-medium">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const status = STATUS_STYLES[s.status];
                return (
                  <tr key={s.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-6 py-3.5 font-medium text-slate-800">{s.id}</td>
                    <td className="px-6 py-3.5 text-slate-600">{s.order}</td>
                    <td className="px-6 py-3.5 text-slate-600">{s.carrier}</td>
                    <td className="px-6 py-3.5 text-slate-500">{s.eta}</td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs ${status.text}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center justify-end gap-3 text-slate-400">
                        <button type="button" aria-label="ดูรายละเอียดการขนส่ง" className="hover:text-slate-600">
                          <Eye size={16} />
                        </button>
                        {NEXT_STATUS[s.status] && (
                          <button
                            type="button"
                            onClick={() => advance(s.id)}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                          >
                            อัปเดตสถานะ
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}