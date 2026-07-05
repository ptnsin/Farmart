import { BarChart3, TrendingUp, Users, ShoppingBag, Percent } from "lucide-react";
import AdminSidebar from "./AdminSidebar";

const STATS = [
  {
    key: "revenue",
    label: "ยอดขายรวม (เดือนนี้)",
    value: "฿1,284,500",
    note: "+8.2% จากเดือนที่แล้ว",
    icon: TrendingUp,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    key: "orders",
    label: "จำนวนคำสั่งซื้อ",
    value: "3,412",
    note: "+5.4% จากเดือนที่แล้ว",
    icon: ShoppingBag,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-500",
  },
  {
    key: "customers",
    label: "ลูกค้าใหม่",
    value: "486",
    note: "+12% จากเดือนที่แล้ว",
    icon: Users,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-500",
  },
  {
    key: "conversion",
    label: "อัตราการสั่งซื้อสำเร็จ",
    value: "94.2%",
    note: "-0.4% จากเดือนที่แล้ว",
    icon: Percent,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
];

const MONTHLY_SALES = [
  { month: "ม.ค.", value: 62 },
  { month: "ก.พ.", value: 70 },
  { month: "มี.ค.", value: 58 },
  { month: "เม.ย.", value: 80 },
  { month: "พ.ค.", value: 74 },
  { month: "มิ.ย.", value: 90 },
  { month: "ก.ค.", value: 100 },
];

const TOP_PRODUCTS = [
  { name: "ข้าวหอมมะลิ ปทุมทาน", category: "ข้าว", sold: 1284, revenue: "฿44,940" },
  { name: "เมล็ดมะเขือเทศ Heirloom", category: "ผักอินทรีย์", sold: 960, revenue: "฿12,000" },
  { name: "สาระอาหารเกียจากสมาร์ทฟาร์ม", category: "สมุนไพร", sold: 742, revenue: "฿13,541" },
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

export default function AdminReports() {
  const maxValue = Math.max(...MONTHLY_SALES.map((m) => m.value));

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto px-6 py-6 md:px-10">
        <div className="flex items-center gap-2 text-emerald-700">
          <BarChart3 size={20} />
          <h1 className="text-2xl font-semibold text-slate-800">รายงาน/สถิติ</h1>
        </div>
        <p className="mt-1 text-sm text-slate-400">
          ภาพรวมยอดขาย คำสั่งซื้อ และสินค้าขายดีของระบบ AgriHarvest
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
          {STATS.map((s) => (
            <StatCard key={s.key} {...s} />
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Sales chart */}
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="text-base font-semibold text-slate-800">ยอดขายรายเดือน</h2>
            <div className="mt-6 flex items-end gap-4" style={{ height: 180 }}>
              {MONTHLY_SALES.map((m) => (
                <div key={m.month} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-md bg-emerald-500"
                    style={{ height: `${(m.value / maxValue) * 140}px` }}
                  />
                  <p className="text-xs text-slate-400">{m.month}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top products */}
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-800">สินค้าขายดี</h2>
            <div className="mt-4 space-y-4">
              {TOP_PRODUCTS.map((p, i) => (
                <div key={p.name} className="flex items-start gap-3">
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
                    {p.revenue}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}