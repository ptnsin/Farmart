import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Bell,
  Eye,
  Pencil,
  Trash2,
  Plus,
  Package,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import EmployeeSidebar from "./EmployeeSidebar";

// ตัวอย่างข้อมูลสินค้า — เชื่อมกับ API คลังสินค้าจริงภายหลัง
export const INITIAL_PRODUCTS = [
  {
    id: "P-001",
    name: "ข้าวหอมมะลิ 100%",
    category: "ข้าวและธัญพืช",
    stock: 82,
    price: 120,
    status: "active",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=64&h=64&fit=crop",
  },
  {
    id: "P-002",
    name: "มะม่วงน้ำดอกไม้",
    category: "ผลไม้",
    stock: 6,
    price: 150,
    status: "low",
    image: "https://images.unsplash.com/photo-1591073113125-e46713c829ed?w=64&h=64&fit=crop",
  },
  {
    id: "P-003",
    name: "ผักกาดขาว",
    category: "ผัก",
    stock: 0,
    price: 45,
    status: "out",
    image: "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=64&h=64&fit=crop",
  },
  {
    id: "P-004",
    name: "ไข่ไก่เบอร์ 0",
    category: "โปรตีน",
    stock: 140,
    price: 105,
    status: "active",
    image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=64&h=64&fit=crop",
  },
  {
    id: "P-005",
    name: "ทุเรียนหมอนทอง",
    category: "ผลไม้",
    stock: 4,
    price: 600,
    status: "low",
    image: "https://images.unsplash.com/photo-1629671305893-73c5a4a2f9f1?w=64&h=64&fit=crop",
  },
];

const STATUS_STYLES = {
  active: { dot: "bg-emerald-500", text: "text-emerald-600", label: "พร้อมขาย" },
  low: { dot: "bg-amber-500", text: "text-amber-600", label: "ใกล้หมด" },
  out: { dot: "bg-rose-500", text: "text-rose-500", label: "สินค้าหมด" },
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

export default function EmployeeWarehouse() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [query, setQuery] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);

  const stats = useMemo(() => {
    const total = products.length;
    const low = products.filter((p) => p.status === "low").length;
    const out = products.filter((p) => p.status === "out").length;
    return { total, low, out };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
    );
  }, [products, query]);

  const confirmDelete = () => {
    setProducts((prev) => prev.filter((p) => p.id !== pendingDelete.id));
    setPendingDelete(null);
  };

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
              placeholder="ค้นหาสินค้าด้วยชื่อหรือรหัสสินค้า..."
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
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-emerald-800">หน้าคลังสินค้า</h1>
            <p className="mt-1 text-sm text-slate-400">
              ภาพรวมสต๊อกสินค้า และจัดการรายการสินค้าทั้งหมด
            </p>
          </div>
          <Link
            to="/employee/warehouse/add"
            className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800"
          >
            <Plus size={16} />
            เพิ่มสินค้า
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="สินค้าทั้งหมด"
            value={stats.total}
            note="รายการในคลังทั้งหมด"
            icon={Package}
            iconBg="bg-slate-100"
            iconColor="text-slate-500"
          />
          <StatCard
            label="สินค้าใกล้หมด"
            value={stats.low}
            note="ควรเติมสต๊อกเร็ว ๆ นี้"
            icon={AlertTriangle}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
          />
          <StatCard
            label="สินค้าหมด"
            value={stats.out}
            note="ไม่พร้อมขายในขณะนี้"
            icon={AlertTriangle}
            iconBg="bg-rose-50"
            iconColor="text-rose-500"
          />
        </div>

        {/* Filter row */}
        <div className="mt-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>ตัวกรองรายการ:</span>
            <button
              type="button"
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700"
            >
              ทั้งหมด
              <ChevronDown size={14} />
            </button>
          </div>
          <p className="text-sm text-slate-400">
            แสดงผล {filteredProducts.length} จาก {products.length} รายการ
          </p>
        </div>

        {/* Table */}
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-100 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-400">
                <th className="px-6 py-3 font-medium">สินค้า</th>
                <th className="px-6 py-3 font-medium">หมวดหมู่</th>
                <th className="px-6 py-3 font-medium">คงเหลือ</th>
                <th className="px-6 py-3 font-medium">ราคา</th>
                <th className="px-6 py-3 font-medium">สถานะ</th>
                <th className="px-6 py-3 text-right font-medium">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const status = STATUS_STYLES[p.status];
                return (
                  <tr key={p.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="h-9 w-9 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium text-slate-800">{p.name}</p>
                          <p className="text-xs text-slate-400">{p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">{p.category}</td>
                    <td className="px-6 py-3.5 font-medium text-slate-800">{p.stock} หน่วย</td>
                    <td className="px-6 py-3.5 text-slate-600">฿{p.price.toLocaleString()}</td>
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
                        <Link
                          to={`/employee/warehouse/edit/${p.id}`}
                          aria-label="แก้ไขสินค้า"
                          className="hover:text-slate-600"
                        >
                          <Pencil size={16} />
                        </Link>
                        <button
                          type="button"
                          aria-label="ลบสินค้า"
                          onClick={() => setPendingDelete(p)}
                          className="hover:text-rose-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-400">
                    ไม่พบสินค้าที่ตรงกับคำค้นหา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-sm rounded-xl border border-slate-100 bg-white p-6 shadow-lg">
            <h3 className="text-base font-semibold text-slate-800">ลบสินค้านี้ใช่หรือไม่?</h3>
            <p className="mt-2 text-sm text-slate-500">
              &quot;{pendingDelete.name}&quot; จะถูกลบออกจากคลังสินค้าอย่างถาวร
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600"
              >
                ลบสินค้า
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}