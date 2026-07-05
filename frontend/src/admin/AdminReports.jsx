import {
  Search,
  HelpCircle,
  BarChart3,
  TrendingUp,
  Users,
  ShoppingBag,
  Percent,
  AlertTriangle,
  Truck,
  PackageX,
  ServerCrash,
  User,
} from "lucide-react";
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

const ISSUE_TYPES = {
  delivery: { label: "จัดส่งไม่สำเร็จ", icon: Truck, color: "text-rose-600 bg-rose-50" },
  stock: { label: "สินค้าไม่ตรงกับสต็อก", icon: PackageX, color: "text-amber-600 bg-amber-50" },
  system: { label: "ระบบขัดข้อง", icon: ServerCrash, color: "text-slate-600 bg-slate-100" },
};

const PRIORITY_STYLES = {
  high: "bg-rose-50 text-rose-600",
  medium: "bg-amber-50 text-amber-600",
  low: "bg-slate-100 text-slate-500",
};

const EMPLOYEE_ISSUES = [
  {
    id: "#ISS-2041",
    employee: "สมหมาย ขับดี",
    role: "พนักงานส่งของ",
    type: "delivery",
    related: "#ORD-2023-001",
    description: "ลูกค้าไม่อยู่บ้านตามเวลานัด และไม่สามารถติดต่อได้ 3 ครั้ง",
    date: "05 ก.ค. 2026",
    priority: "high",
    status: "pending",
  },
  {
    id: "#ISS-2038",
    employee: "วิชัย ยิ้มรัน",
    role: "พนักงานคลังสินค้า",
    type: "stock",
    related: "SKU: PHT-009",
    description: "จำนวนสินค้าจริงในคลังน้อยกว่าที่ระบบแสดง 18 หน่วย",
    date: "04 ก.ค. 2026",
    priority: "medium",
    status: "investigating",
  },
  {
    id: "#ISS-2035",
    employee: "รุ่งโรจน์ บาร์เก็ต",
    role: "พนักงานส่งของ",
    type: "delivery",
    related: "#ORD-2023-012",
    description: "พัสดุเสียหายระหว่างการขนส่งจากอุบัติเหตุรถเสีย",
    date: "03 ก.ค. 2026",
    priority: "high",
    status: "resolved",
  },
  {
    id: "#ISS-2031",
    employee: "อรุณ พันธุ์ดี",
    role: "พนักงานคลังสินค้า",
    type: "system",
    related: "ระบบสแกน SKU",
    description: "เครื่องสแกนบาร์โค้ดที่คลังสินค้าโซน B อ่านรหัสไม่ได้ตั้งแต่เช้า",
    date: "02 ก.ค. 2026",
    priority: "low",
    status: "resolved",
  },
];

const STATUS_STYLES = {
  pending: { label: "รอดำเนินการ", dot: "bg-amber-500", text: "text-amber-600" },
  investigating: { label: "กำลังตรวจสอบ", dot: "bg-sky-500", text: "text-sky-600" },
  resolved: { label: "แก้ไขแล้ว", dot: "bg-emerald-500", text: "text-emerald-600" },
};

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
        {/* Top bar */}
        <div className="mb-8 flex items-center gap-4">
          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="ค้นหารายงานหรือสถิติ..."
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

        <div className="flex items-center gap-2 text-emerald-700">
          <BarChart3 size={20} />
          <h1 className="text-2xl font-semibold text-slate-800">รายงาน/สถิติ</h1>
        </div>
        <p className="mt-1 text-sm text-slate-400">
          ภาพรวมยอดขาย คำสั่งซื้อ และสินค้าขายดีของระบบ Farmart
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

        {/* Employee-reported issues */}
        <div className="mt-6 rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-800">
              <AlertTriangle size={18} className="text-rose-500" />
              ปัญหาที่พนักงานแจ้งเข้ามา
            </h2>
            <span className="text-xs text-slate-400">
              {EMPLOYEE_ISSUES.filter((i) => i.status !== "resolved").length} รายการรอดำเนินการ
            </span>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-slate-100">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-400">
                  <th className="px-6 py-3 font-medium">รหัส</th>
                  <th className="px-6 py-3 font-medium">พนักงาน</th>
                  <th className="px-6 py-3 font-medium">ประเภทปัญหา</th>
                  <th className="px-6 py-3 font-medium">ที่เกี่ยวข้อง</th>
                  <th className="px-6 py-3 font-medium">รายละเอียด</th>
                  <th className="px-6 py-3 font-medium">ความสำคัญ</th>
                  <th className="px-6 py-3 font-medium">วันที่แจ้ง</th>
                  <th className="px-6 py-3 font-medium">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {EMPLOYEE_ISSUES.map((issue) => {
                  const type = ISSUE_TYPES[issue.type];
                  const TypeIcon = type.icon;
                  const status = STATUS_STYLES[issue.status];
                  return (
                    <tr key={issue.id} className="border-b border-slate-50 last:border-0">
                      <td className="px-6 py-3.5 font-medium text-slate-800">{issue.id}</td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                            <User size={13} />
                          </span>
                          <div>
                            <p className="text-slate-700">{issue.employee}</p>
                            <p className="text-xs text-slate-400">{issue.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${type.color}`}
                        >
                          <TypeIcon size={12} />
                          {type.label}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-slate-500">{issue.related}</td>
                      <td className="max-w-xs px-6 py-3.5 text-slate-600">{issue.description}</td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${PRIORITY_STYLES[issue.priority]}`}
                        >
                          {issue.priority === "high"
                            ? "สูง"
                            : issue.priority === "medium"
                            ? "กลาง"
                            : "ต่ำ"}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-slate-500">{issue.date}</td>
                      <td className="px-6 py-3.5">
                        <span className={`flex items-center gap-1.5 whitespace-nowrap ${status.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {EMPLOYEE_ISSUES.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-sm text-slate-400">
                      ยังไม่มีปัญหาที่พนักงานแจ้งเข้ามา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}