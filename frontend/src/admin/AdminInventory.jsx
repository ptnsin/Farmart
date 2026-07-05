import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  RefreshCw,
  AlertTriangle,
  Camera,
  RotateCw,
  Plus,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Eye,
  Pencil,
  MoreVertical,
} from "lucide-react";
import AdminSidebar from "./AdminSidebar";

const PRODUCTS = [
  {
    id: 1,
    name: "เมล็ดมะเขือเทศ Heirloom",
    category: "ผักอินทรีย์",
    sku: "HTS-2024-01",
    price: 12.5,
    stockUnits: 450,
    stockPercent: 75,
    stockLevel: "healthy",
    farmer: "แสงฟาร์มอินทรีย์, สวยรัตน์ฟาร์ม",
    image: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=64&h=64&fit=crop",
  },
  {
    id: 2,
    name: "ข้าวหอมมะลิ ปทุมทาน",
    category: "ข้าว",
    sku: "PHT-009",
    price: 34.99,
    stockUnits: 12,
    stockPercent: 8,
    stockLevel: "low",
    farmer: "เพชรบัตร, สวนอาม่าตร",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=64&h=64&fit=crop",
  },
  {
    id: 3,
    name: "สาระอาหารเกียจากสมาร์ทฟาร์ม",
    category: "สมุนไพร",
    sku: "LSF-221",
    price: 18.25,
    stockUnits: 2100,
    stockPercent: 92,
    stockLevel: "healthy",
    farmer: "แสงรวี (ภาคเหนือ)",
    image: "https://images.unsplash.com/photo-1515586838455-8f8f940d6853?w=64&h=64&fit=crop",
  },
];

const STATS = [
  {
    key: "total",
    label: "สินค้าทั้งหมด",
    value: "1,248",
    note: "+4.5%",
    icon: RefreshCw,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    noteColor: "text-emerald-600",
  },
  {
    key: "low",
    label: "สินค้าใกล้หมด",
    value: "42",
    note: "12 รายการวิกฤต",
    icon: AlertTriangle,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    noteColor: "text-rose-500",
  },
  {
    key: "value",
    label: "มูลค่าสินค้าคงคลัง",
    value: "$248.5k",
    note: "",
    icon: Camera,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-500",
    noteColor: "text-slate-400",
  },
  {
    key: "status",
    label: "สถานะการสั่งซื้อ",
    value: "ทุกอย่างปกติ",
    note: "",
    icon: RotateCw,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-500",
    noteColor: "text-slate-400",
  },
];

const TOTAL_PAGES = 125;
const TOTAL_RECORDS = 1248;

function StatCard({ label, value, note, noteColor, icon: Icon, iconBg, iconColor }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className={`flex h-11 w-11 items-center justify-center rounded-full ${iconBg} ${iconColor}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs font-medium tracking-wide text-slate-400">{label}</p>
        <p className={`font-semibold text-slate-800 ${value === "ทุกอย่างปกติ" ? "text-base" : "text-2xl"}`}>
          {value}
        </p>
        {note && <p className={`text-xs ${noteColor}`}>{note}</p>}
      </div>
    </div>
  );
}

export default function AdminInventory() {
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);

  const allSelected = selected.length === PRODUCTS.length;

  const toggleAll = () => {
    setSelected(allSelected ? [] : PRODUCTS.map((p) => p.id));
  };

  const toggleOne = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto px-6 py-6 md:px-10">
        {/* Top bar */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="relative w-80 max-w-full">
            <input
              type="text"
              placeholder="ค้นหาสินค้า..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-4 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
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

        {/* Breadcrumb */}
        <p className="text-xs text-slate-400">แดชบอร์ด &gt; คลังสินค้า</p>

        {/* Heading */}
        <div className="mt-1 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">รายการสินค้าทั้งหมด</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-400">
              จัดการเกษตรกิจติดตามสินค้าคงคลัง เครื่องมือ และปุ๋ย ปรับปรุงราคา ติดตามระดับการเก็บ
              และจัดระเบียบหมวดหมู่ของคุณ
            </p>
          </div>
          <Link
            to="/admin/inventory/new"
            className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800"
          >
            <Plus size={16} />
            เพิ่มสินค้าใหม่
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
          {STATS.map((stat) => (
            <StatCard key={stat.key} {...stat} />
          ))}
        </div>

        {/* Toolbar */}
        <div className="mt-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              จัดการพร้อมกัน
            </button>
            <button
              type="button"
              aria-label="กรอง"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            >
              <Filter size={14} />
            </button>
          </div>
          <p className="text-sm text-slate-400">
            แสดง 1 - {PRODUCTS.length} จาก {TOTAL_RECORDS.toLocaleString()} รายการ
          </p>
        </div>

        {/* Table */}
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-100 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-400">
                <th className="w-10 px-6 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-slate-300 accent-emerald-600"
                  />
                </th>
                <th className="px-3 py-3 font-medium">สินค้า</th>
                <th className="px-6 py-3 font-medium">หมวดหมู่</th>
                <th className="px-6 py-3 font-medium">ราคา</th>
                <th className="px-6 py-3 font-medium">ระดับสต็อก</th>
                <th className="px-6 py-3 font-medium">เจ้าของฟาร์ม</th>
                <th className="px-6 py-3 text-right font-medium">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {PRODUCTS.map((product) => (
                <tr key={product.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-6 py-3.5">
                    <input
                      type="checkbox"
                      checked={selected.includes(product.id)}
                      onChange={() => toggleOne(product.id)}
                      className="h-4 w-4 rounded border-slate-300 accent-emerald-600"
                    />
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium text-slate-800">{product.name}</p>
                        <p className="text-xs text-slate-400">SKU: {product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-slate-600">{product.category}</td>
                  <td className="px-6 py-3.5 font-medium text-slate-800">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="w-32">
                      <p
                        className={`text-xs font-medium ${
                          product.stockLevel === "low" ? "text-rose-500" : "text-emerald-600"
                        }`}
                      >
                        {product.stockUnits.toLocaleString()} หน่วย {product.stockPercent}%
                      </p>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${
                            product.stockLevel === "low" ? "bg-rose-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${product.stockPercent}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                      {product.farmer}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center justify-end gap-3 text-slate-400">
                      <Link
                        to={`/admin/inventory/${product.id}`}
                        aria-label="ดูข้อมูล"
                        className="hover:text-slate-600"
                      >
                        <Eye size={16} />
                      </Link>
                      <button type="button" aria-label="แก้ไข" className="hover:text-slate-600">
                        <Pencil size={16} />
                      </button>
                      <button type="button" aria-label="เพิ่มเติม" className="hover:text-slate-600">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3 text-sm">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className={`h-8 w-8 rounded-lg text-sm ${
                    page === n
                      ? "bg-emerald-700 font-medium text-white"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {n}
                </button>
              ))}
              <span className="px-1 text-slate-400">...</span>
              <button
                type="button"
                onClick={() => setPage(TOTAL_PAGES)}
                className="h-8 w-8 rounded-lg text-sm text-slate-500 hover:bg-slate-50"
              >
                {TOTAL_PAGES}
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(TOTAL_PAGES, p + 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              แสดงต่อหน้า:
              <button
                type="button"
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 font-medium text-slate-700"
              >
                10
                <ChevronDown size={12} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}