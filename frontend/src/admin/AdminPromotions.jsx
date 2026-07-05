import { useState } from "react";
import { Search, HelpCircle, Plus, BadgePercent, Pencil, Trash2, Power } from "lucide-react";
import AdminSidebar from "./AdminSidebar";

const STATUS_STYLES = {
  active: { dot: "bg-emerald-500", text: "text-emerald-600", label: "ใช้งานอยู่" },
  scheduled: { dot: "bg-amber-500", text: "text-amber-600", label: "รอเริ่มใช้" },
  expired: { dot: "bg-slate-400", text: "text-slate-400", label: "หมดอายุ" },
};

const PROMOTIONS = [
  {
    id: 1,
    code: "HARVEST10",
    description: "ลด 10% สำหรับผักและผลไม้ออร์แกนิกทั้งหมด",
    type: "percent",
    value: 10,
    period: "01 ก.ค. – 31 ก.ค. 2026",
    status: "active",
    used: 214,
  },
  {
    id: 2,
    code: "NEWFARMER50",
    description: "ลด 50 บาท เมื่อสั่งซื้อจากเกษตรกรรายใหม่ครั้งแรก",
    type: "fixed",
    value: 50,
    period: "15 ก.ค. – 15 ส.ค. 2026",
    status: "scheduled",
    used: 0,
  },
  {
    id: 3,
    code: "RICEFEST20",
    description: "ลด 20% หมวดข้าวและธัญพืช เนื่องในเทศกาลข้าวใหม่",
    type: "percent",
    value: 20,
    period: "01 มิ.ย. – 30 มิ.ย. 2026",
    status: "expired",
    used: 891,
  },
];

export default function AdminPromotions() {
  const [promotions, setPromotions] = useState(PROMOTIONS);

  const toggleStatus = (id) =>
    setPromotions((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: p.status === "active" ? "expired" : "active" }
          : p
      )
    );

  const remove = (id) => setPromotions((prev) => prev.filter((p) => p.id !== id));

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
              placeholder="ค้นหาโปรโมชั่นด้วยโค้ดหรือรายละเอียด..."
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

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-700">
              <BadgePercent size={20} />
              <h1 className="text-2xl font-semibold text-slate-800">โปรโมชั่น/ส่วนลด</h1>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              สร้างและจัดการโค้ดส่วนลดสำหรับลูกค้าในร้าน Farmart
            </p>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800"
          >
            <Plus size={16} />
            สร้างโปรโมชั่นใหม่
          </button>
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-slate-100 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-400">
                <th className="px-6 py-3 font-medium">โค้ด</th>
                <th className="px-6 py-3 font-medium">รายละเอียด</th>
                <th className="px-6 py-3 font-medium">ส่วนลด</th>
                <th className="px-6 py-3 font-medium">ระยะเวลา</th>
                <th className="px-6 py-3 font-medium">ใช้ไปแล้ว</th>
                <th className="px-6 py-3 font-medium">สถานะ</th>
                <th className="px-6 py-3 text-right font-medium">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {promotions.map((p) => {
                const s = STATUS_STYLES[p.status];
                return (
                  <tr key={p.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-6 py-3.5 font-mono font-medium text-slate-800">{p.code}</td>
                    <td className="max-w-xs px-6 py-3.5 text-slate-600">{p.description}</td>
                    <td className="px-6 py-3.5 font-medium text-emerald-700">
                      {p.type === "percent" ? `${p.value}%` : `฿${p.value}`}
                    </td>
                    <td className="px-6 py-3.5 text-slate-500">{p.period}</td>
                    <td className="px-6 py-3.5 text-slate-600">{p.used.toLocaleString()} ครั้ง</td>
                    <td className="px-6 py-3.5">
                      <span className={`flex items-center gap-1.5 ${s.text}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                        {s.label}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center justify-end gap-3 text-slate-400">
                        <button
                          type="button"
                          onClick={() => toggleStatus(p.id)}
                          aria-label="เปิด/ปิดการใช้งาน"
                          className="hover:text-slate-600"
                        >
                          <Power size={16} />
                        </button>
                        <button type="button" aria-label="แก้ไข" className="hover:text-slate-600">
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(p.id)}
                          aria-label="ลบ"
                          className="hover:text-rose-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {promotions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-400">
                    ยังไม่มีโปรโมชั่นในระบบ
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