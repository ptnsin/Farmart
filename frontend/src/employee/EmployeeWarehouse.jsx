import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Pencil, Trash2, Plus, Package, AlertTriangle, ChevronDown } from "lucide-react";
import EmployeeSidebar from "./EmployeeSidebar";
import EmployeeTopBar from "./EmployeeTopBar";
import { getProducts, deleteProduct } from "../data/productStore";

const STATUS_STYLES = {
  healthy: { dot: "bg-emerald-500", text: "text-emerald-600", label: "พร้อมขาย" },
  low: { dot: "bg-amber-500", text: "text-amber-600", label: "ใกล้หมด" },
  out: { dot: "bg-rose-500", text: "text-rose-500", label: "สินค้าหมด" },
};

const APPROVAL_STYLES = {
  pending: { text: "text-amber-600", bg: "bg-amber-50", label: "รอ admin อนุมัติ" },
  rejected: { text: "text-rose-500", bg: "bg-rose-50", label: "ถูกปฏิเสธ" },
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
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError("");
    getProducts()
      .then((data) => {
        if (!cancelled) setProducts(data);
      })
      .catch(() => {
        if (!cancelled) setLoadError("โหลดข้อมูลสินค้าไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const total = products.length;
    const low = products.filter((p) => p.stockLevel === "low").length;
    const out = products.filter((p) => p.stockLevel === "out").length;
    return { total, low, out };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        String(p.id).toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q)
    );
  }, [products, query]);

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const remaining = await deleteProduct(pendingDelete.id);
      setProducts(remaining);
      setPendingDelete(null);
    } catch {
      alert("ลบสินค้าไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <EmployeeSidebar />

      <main className="flex-1 overflow-y-auto px-6 py-6 md:px-10">
        <EmployeeTopBar search={query} onSearchChange={setQuery} />

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

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="สินค้าทั้งหมด" value={stats.total} note="รายการในคลังทั้งหมด" icon={Package} iconBg="bg-slate-100" iconColor="text-slate-500" />
          <StatCard label="สินค้าใกล้หมด" value={stats.low} note="ควรเติมสต๊อกเร็ว ๆ นี้" icon={AlertTriangle} iconBg="bg-amber-50" iconColor="text-amber-600" />
          <StatCard label="สินค้าหมด" value={stats.out} note="ไม่พร้อมขายในขณะนี้" icon={AlertTriangle} iconBg="bg-rose-50" iconColor="text-rose-500" />
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>ตัวกรองรายการ:</span>
            <button type="button" className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700">
              ทั้งหมด
              <ChevronDown size={14} />
            </button>
          </div>
          <p className="text-sm text-slate-400">
            แสดงผล {filteredProducts.length} จาก {products.length} รายการ
          </p>
        </div>

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
              {loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-400">
                    กำลังโหลดข้อมูลสินค้า...
                  </td>
                </tr>
              )}
              {!loading && loadError && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-rose-500">
                    {loadError}
                  </td>
                </tr>
              )}
              {!loading &&
                !loadError &&
                filteredProducts.map((p) => {
                  const status = STATUS_STYLES[p.stockLevel] || STATUS_STYLES.healthy;
                  const approval =
                    p.approvalStatus && p.approvalStatus !== "approved"
                      ? APPROVAL_STYLES[p.approvalStatus]
                      : null;
                  return (
                    <tr key={p.id} className="border-b border-slate-50 last:border-0">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src =
                                "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='36' height='36'><rect width='36' height='36' rx='8' fill='%23f1f5f9'/></svg>";
                            }}
                            className="h-9 w-9 rounded-lg border border-slate-100 object-cover"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-slate-800">{p.name}</p>
                              {approval && (
                                <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${approval.bg} ${approval.text}`}>
                                  {approval.label}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400">{p.sku || p.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">{p.category}</td>
                      <td className="px-6 py-3.5 font-medium text-slate-800">
                        {p.stockUnits} {p.unit || "หน่วย"}
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">฿{Number(p.price).toLocaleString()}</td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-xs ${status.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center justify-end gap-3 text-slate-400">
                          <Link to={`/employee/warehouse/edit/${p.id}`} aria-label="ดูรายละเอียด" className="hover:text-slate-600">
                            <Eye size={16} />
                          </Link>
                          <Link to={`/employee/warehouse/edit/${p.id}`} aria-label="แก้ไขสินค้า" className="hover:text-slate-600">
                            <Pencil size={16} />
                          </Link>
                          <button type="button" aria-label="ลบสินค้า" onClick={() => setPendingDelete(p)} className="hover:text-rose-500">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              {!loading && !loadError && filteredProducts.length === 0 && (
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
              <button type="button" onClick={() => setPendingDelete(null)} disabled={deleting} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50">
                ยกเลิก
              </button>
              <button type="button" onClick={confirmDelete} disabled={deleting} className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600 disabled:opacity-50">
                {deleting ? "กำลังลบ..." : "ลบสินค้า"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}