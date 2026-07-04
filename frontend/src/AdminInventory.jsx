import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  HelpCircle,
  Plus,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import AdminSidebar from "./AdminSidebar";

// Swap this for real data from productsData.js / an API call.
const PRODUCTS = [
  {
    id: "HTS-2024-01",
    name: "เมล็ดมะเขือเทศ Heirloom",
    category: "เมล็ดพันธุ์",
    price: "$12.50",
    stock: 450,
    stockPct: 75,
    tone: "good",
    supplier: "เกษตรอโยธยา, สุพรรณบุรี",
    emoji: "🍅",
  },
  {
    id: "PHT-009",
    name: "ขวดพรวนดินอเนกประสงค์",
    category: "อุปกรณ์",
    price: "$34.99",
    stock: 12,
    stockPct: 8,
    tone: "low",
    supplier: "เอฟเฟิร์ต, เชียงใหม่",
    emoji: "🪴",
  },
  {
    id: "LSF-221",
    name: "สารอาหารพืชจากสาหร่ายทะเล",
    category: "สารอาหาร",
    price: "$18.25",
    stock: 2100,
    stockPct: 92,
    tone: "good",
    supplier: "บลูปอนด์ (ภาคใต้)",
    emoji: "🧪",
  },
];

const STATS = [
  {
    icon: TrendingUp,
    tone: "emerald",
    label: "สินค้าที่เพิ่ม",
    value: "1,248",
    delta: "+4.5%",
  },
  {
    icon: AlertTriangle,
    tone: "amber",
    label: "สินค้าใกล้หมด",
    value: "42",
    delta: "12 รายการวิกฤต",
  },
  {
    icon: DollarSign,
    tone: "indigo",
    label: "มูลค่าสินค้ารวม",
    value: "$248.5k",
    delta: null,
  },
  {
    icon: RefreshCw,
    tone: "slate",
    label: "สถานะการซิงค์",
    value: "ทุกโหมดปกติ",
    delta: null,
  },
];

const TONE_CLASSES = {
  emerald: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  indigo: "bg-indigo-50 text-indigo-700",
  slate: "bg-slate-100 text-slate-600",
};

const DELTA_CLASSES = {
  emerald: "text-emerald-600",
  amber: "text-red-500",
  indigo: "text-slate-500",
  slate: "text-slate-500",
};

function StatCard({ icon: Icon, tone, label, value, delta }) {
  return (
    <div className="relative flex items-start gap-3 rounded-lg border border-slate-100 bg-white p-4 shadow-sm">
      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${TONE_CLASSES[tone]}`}>
        <Icon size={16} />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-lg font-bold text-slate-800">{value}</p>
      </div>
      {delta && (
        <span className={`absolute right-4 top-4 text-xs font-semibold ${DELTA_CLASSES[tone]}`}>
          {delta}
        </span>
      )}
    </div>
  );
}

export default function AdminInventory() {
  const [query, setQuery] = useState("");

  const filteredProducts = useMemo(() => {
    if (!query.trim()) return PRODUCTS;
    const q = query.trim().toLowerCase();
    return PRODUCTS.filter(
      (p) => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto px-6 py-6 md:px-8">
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
            placeholder="ค้นหาเลขสินค้า..."
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

      <p className="mb-2 text-xs text-slate-500">แดชบอร์ด / คลังสินค้า</p>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">รายการสินค้าทั้งหมด</h1>
          <p className="mt-1 max-w-xl text-sm text-slate-500">
            ดูภาพรวมสต็อกสินค้าเกษตร ตรวจสอบคุณภาพ เครื่องมือ และปุ๋ย อัปเดตตารางราคา
            ติดตามระดับสต็อก และจัดระเบียบหมวดหมู่สินค้า
          </p>
        </div>
        <Link
          to="/admin/inventory/new"
          className="flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          <Plus size={16} />
          เพิ่มสินค้าใหม่
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <button className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
            จัดการพร้อมกัน
          </button>
          <p className="text-xs text-slate-500">
            แสดง <span className="font-semibold text-slate-700">1-{filteredProducts.length}</span> จาก 1,248 รายการ
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="w-9 px-5 py-3">
                  <input type="checkbox" className="rounded border-slate-300" />
                </th>
                <th className="px-3 py-3">สินค้า</th>
                <th className="px-3 py-3">หมวดหมู่</th>
                <th className="px-3 py-3">ราคา</th>
                <th className="px-3 py-3">ระดับสต็อก</th>
                <th className="px-3 py-3">เเหล่งที่มา</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-5 py-3">
                    <input type="checkbox" className="rounded border-slate-300" />
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-lg">
                        {p.emoji}
                      </div>
                      <div>
                        <Link
                          to={`/admin/inventory/${p.id}`}
                          className="font-semibold text-slate-800 hover:text-emerald-700"
                        >
                          {p.name}
                        </Link>
                        <p className="text-xs text-slate-400">SKU: {p.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-slate-600">{p.category}</td>
                  <td className="px-3 py-3 font-semibold text-slate-800">{p.price}</td>
                  <td className="px-3 py-3">
                    <div className="flex w-32 flex-col gap-1">
                      <span className="text-xs text-slate-500">
                        {p.stock.toLocaleString()} หน่วย
                      </span>
                      <div className="h-1.5 rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${
                            p.tone === "good" ? "bg-emerald-600" : "bg-red-500"
                          }`}
                          style={{ width: `${p.stockPct}%` }}
                        />
                      </div>
                      <span
                        className={`text-xs font-bold ${
                          p.tone === "good" ? "text-emerald-600" : "text-red-500"
                        }`}
                      >
                        {p.stockPct}%
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                      🚚 {p.supplier}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right text-slate-300">
                    <button className="hover:text-slate-500">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-400">
                    ไม่พบสินค้าที่ตรงกับคำค้นหา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 px-5 py-3">
          <button className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50">
            <ChevronLeft size={16} />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-700 text-sm font-bold text-white">
            1
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">
            2
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">
            3
          </button>
          <span className="px-1 text-xs text-slate-400">...</span>
          <button className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">
            125
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50">
            <ChevronRight size={16} />
          </button>
          <div className="ml-auto flex items-center gap-2 text-xs text-slate-500">
            ตรวจดูหน้า:
            <input
              defaultValue={10}
              className="w-12 rounded-md border border-slate-200 px-2 py-1 text-center"
            />
          </div>
        </div>
      </div>
      </main>
    </div>
  );
}