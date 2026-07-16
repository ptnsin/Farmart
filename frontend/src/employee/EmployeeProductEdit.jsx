import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, UploadCloud, Trash2 } from "lucide-react";
import EmployeeSidebar from "./EmployeeSidebar";
import EmployeeTopBar from "./EmployeeTopBar";
import { getProductById, updateProduct, deleteProduct } from "../data/productStore";

const CATEGORIES = ["เมล็ดพันธุ์", "ฮอร์โมน", "ปุ๋ย", "อุปกรณ์จัดการดิน", "อุปกรณ์รดน้ำ", "กระถาง"];

export default function EmployeeProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false); // <-- ใหม่: คุม modal

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError("");
    getProductById(id)
      .then((p) => {
        if (cancelled) return;
        setProduct(p);
        setForm({
          name: p.name,
          category: p.category,
          unit: p.unit || "",
          price: p.price,
          cost: p.cost ?? "",
          stock: p.stockUnits,
          farmer: p.farmer || "",
          location: p.location || "",
          description: p.description || "",
        });
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
  }, [id]);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError("");
    setSaving(true);
    try {
      await updateProduct(id, {
        name: form.name,
        category: form.category,
        unit: form.unit,
        price: Number(form.price),
        cost: form.cost === "" ? undefined : Number(form.cost),
        stockUnits: Number(form.stock),
        farmer: form.farmer,
        location: form.location,
        description: form.description,
      });
      setSaved(true);
      setTimeout(() => navigate("/employee/warehouse"), 900);
    } catch {
      setSaveError("บันทึกการแก้ไขไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteProduct(id);
      navigate("/employee/warehouse");
    } catch {
      setSaveError("ลบสินค้าไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      setDeleting(false);
      setConfirmingDelete(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <EmployeeSidebar />

      <main className="flex-1 overflow-y-auto px-6 py-6 md:px-10">
        <EmployeeTopBar />

        <Link to="/employee/warehouse" className="mb-2 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-emerald-700">
          <ArrowLeft size={15} />
          กลับไปหน้าคลังสินค้า
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-emerald-800">แก้ไขสินค้า</h1>
            <p className="mt-1 text-sm text-slate-400">รหัสสินค้า: {product?.sku || product?.id || id}</p>
          </div>
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            disabled={deleting || loading}
            className="flex items-center gap-2 rounded-lg border border-rose-200 px-4 py-2.5 text-sm font-medium text-rose-500 hover:bg-rose-50 disabled:opacity-50"
          >
            <Trash2 size={16} />
            ลบสินค้านี้
          </button>
        </div>

        {loading && (
          <div className="mt-6 rounded-xl border border-slate-100 bg-white p-10 text-center text-sm text-slate-400">
            กำลังโหลดข้อมูลสินค้า...
          </div>
        )}

        {!loading && loadError && (
          <div className="mt-6 rounded-xl border border-slate-100 bg-white p-10 text-center text-sm text-rose-500">
            {loadError}
          </div>
        )}

        {!loading && !loadError && form && (
          <form onSubmit={handleSubmit} className="mt-6 rounded-xl border border-slate-100 bg-white p-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-600">ชื่อสินค้า</label>
                <input className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" value={form.name} onChange={update("name")} required />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-600">หมวดหมู่</label>
                <select className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" value={form.category} onChange={update("category")}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-600">หน่วยนับ</label>
                <input className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" value={form.unit} onChange={update("unit")} placeholder="เช่น ซอง, ขวด, ถุง 25 กก." />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-600">ราคาต่อหน่วย (บาท)</label>
                <input type="number" min="0" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" value={form.price} onChange={update("price")} required />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-600">ต้นทุนต่อหน่วย (บาท)</label>
                <input type="number" min="0" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" value={form.cost} onChange={update("cost")} placeholder="ไม่บังคับ" />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-600">จำนวนคงเหลือ</label>
                <input type="number" min="0" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" value={form.stock} onChange={update("stock")} required />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-600">ผู้จำหน่าย</label>
                <input className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" value={form.farmer} onChange={update("farmer")} />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-600">แหล่งผลิต</label>
                <input className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" value={form.location} onChange={update("location")} />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-600">รูปภาพสินค้า</label>
                <div className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 px-4 py-6 text-center text-slate-400 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700">
                  <UploadCloud size={22} className="mb-2" />
                  <p className="text-sm">คลิกเพื่อเปลี่ยนรูปภาพสินค้า</p>
                  <p className="mt-1 text-xs text-slate-400">รองรับ JPG, PNG ไม่เกิน 5MB</p>
                </div>
                {/* TODO: ต่อ upload จริงแบบเดียวกับ EmployeeProductAdd.jsx (api.post('/api/upload/product', formData)) */}
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-600">รายละเอียดสินค้า</label>
                <textarea rows={4} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" placeholder="อธิบายรายละเอียด แหล่งที่มา หรือวิธีการเก็บรักษา" value={form.description} onChange={update("description")} />
              </div>
            </div>

            {saveError && <p className="mt-4 text-sm text-rose-500">{saveError}</p>}

            <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
              <Link to="/employee/warehouse" className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                ยกเลิก
              </Link>
              <button type="submit" disabled={saving} className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50">
                {saving ? "กำลังบันทึก..." : saved ? "บันทึกแล้ว ✓" : "บันทึกการแก้ไข"}
              </button>
            </div>
          </form>
        )}
      </main>

      {confirmingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-sm rounded-xl border border-slate-100 bg-white p-6 shadow-lg">
            <h3 className="text-base font-semibold text-slate-800">ลบสินค้านี้ใช่หรือไม่?</h3>
            <p className="mt-2 text-sm text-slate-500">
              &quot;{product?.name}&quot; จะถูกลบออกจากคลังสินค้าอย่างถาวร
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setConfirmingDelete(false)} disabled={deleting} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50">
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