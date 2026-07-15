import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, Plus, BadgePercent, Pencil, Trash2, Power, X, Loader2 } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import { getCachedUser, fetchCurrentUser } from "../data/authStore";
import {
  getPromotions,
  addPromotion,
  updatePromotion,
  togglePromotionStatus,
  deletePromotion,
} from "../data/promotionStore";

const STATUS_STYLES = {
  active: { dot: "bg-emerald-500", text: "text-emerald-600", label: "ใช้งานอยู่" },
  scheduled: { dot: "bg-amber-500", text: "text-amber-600", label: "รอเริ่มใช้" },
  expired: { dot: "bg-slate-400", text: "text-slate-400", label: "หมดอายุ" },
};

const EMPTY_FORM = {
  code: "",
  description: "",
  type: "percent",
  value: "",
  period: "",
  status: "scheduled",
};

export default function AdminPromotions() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(getCachedUser());
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null); // null = สร้างใหม่, object = กำลังแก้ไข
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchCurrentUser()
      .then(setCurrentUser)
      .catch((err) => {
        if (err.message.includes("เข้าสู่ระบบ")) navigate("/");
      });
  }, [navigate]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getPromotions()
      .then((data) => {
        if (!cancelled) setPromotions(data);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.message.includes("เข้าสู่ระบบ")) {
          navigate("/");
          return;
        }
        setLoadError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const filteredPromotions = promotions.filter((p) => {
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    return p.code.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
  });

  const openCreateModal = () => {
    setEditingPromotion(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (promo) => {
    setEditingPromotion(promo);
    setForm({
      code: promo.code || "",
      description: promo.description || "",
      type: promo.type || "percent",
      value: String(promo.value ?? ""),
      period: promo.period || "",
      status: promo.status || "scheduled",
    });
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingPromotion(null);
  };

  const updateForm = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.description.trim()) {
      setFormError("กรุณากรอกรายละเอียดโปรโมชั่น");
      return;
    }
    const numericValue = Number(form.value);
    if (!form.value || Number.isNaN(numericValue) || numericValue <= 0) {
      setFormError("กรุณากรอกมูลค่าส่วนลดให้ถูกต้อง");
      return;
    }

    const payload = {
      code: form.code.trim() || undefined,
      description: form.description.trim(),
      type: form.type,
      value: numericValue,
      period: form.period.trim(),
      status: form.status,
    };

    setSaving(true);
    try {
      if (editingPromotion) {
        const updated = await updatePromotion(editingPromotion.id, payload);
        setPromotions((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      } else {
        const created = await addPromotion(payload);
        setPromotions((prev) => [created, ...prev]);
      }
      setModalOpen(false);
      setEditingPromotion(null);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (id) => {
    setTogglingId(id);
    try {
      const updated = await togglePromotionStatus(id);
      setPromotions((prev) => prev.map((p) => (p.id === id ? updated : p)));
    } catch (err) {
      alert(err.message);
    } finally {
      setTogglingId(null);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("ต้องการลบโปรโมชั่นนี้หรือไม่?")) return;
    setDeletingId(id);
    try {
      const remaining = await deletePromotion(id);
      setPromotions(remaining);
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto px-6 py-6 md:px-10">
        {loading && (
          <div className="mb-4 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
            กำลังโหลดข้อมูลโปรโมชั่น...
          </div>
        )}
        {loadError && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {loadError}
          </div>
        )}
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
              placeholder="ค้นหาโปรโมชั่นด้วยโค้ดหรือรายละเอียด..."
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
              src={currentUser?.avatar || "https://i.pravatar.cc/64?img=12"}
              alt=""
              className="h-8 w-8 rounded-full object-cover"
            />
            <div className="leading-tight">
              <p className="text-sm font-medium text-slate-800">{currentUser?.name || "Admin"}</p>
              <p className="text-xs text-slate-400">{currentUser?.role || "Admin"}</p>
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
            onClick={openCreateModal}
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
              {filteredPromotions.map((p) => {
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
                          disabled={togglingId === p.id}
                          aria-label="เปิด/ปิดการใช้งาน"
                          className="hover:text-slate-600 disabled:opacity-50"
                        >
                          {togglingId === p.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Power size={16} />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(p)}
                          aria-label="แก้ไข"
                          className="hover:text-slate-600"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(p.id)}
                          disabled={deletingId === p.id}
                          aria-label="ลบ"
                          className="hover:text-rose-500 disabled:opacity-50"
                        >
                          {deletingId === p.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredPromotions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-400">
                    {promotions.length === 0
                      ? "ยังไม่มีโปรโมชั่นในระบบ"
                      : "ไม่พบโปรโมชั่นที่ตรงกับคำค้นหา"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-semibold text-slate-800">
                <BadgePercent size={18} className="text-emerald-600" />
                {editingPromotion ? "แก้ไขโปรโมชั่น" : "สร้างโปรโมชั่นใหม่"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                aria-label="ปิด"
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-slate-600">โค้ดส่วนลด</label>
                <input
                  value={form.code}
                  onChange={updateForm("code")}
                  type="text"
                  placeholder="เว้นว่างไว้ให้ระบบตั้งให้อัตโนมัติ"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono uppercase outline-none placeholder:font-sans placeholder:normal-case placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-600">รายละเอียด</label>
                <input
                  required
                  value={form.description}
                  onChange={updateForm("description")}
                  type="text"
                  placeholder="เช่น ลด 10% สำหรับผักและผลไม้ออร์แกนิกทั้งหมด"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm text-slate-600">ประเภทส่วนลด</label>
                  <select
                    value={form.type}
                    onChange={updateForm("type")}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  >
                    <option value="percent">เปอร์เซ็นต์ (%)</option>
                    <option value="fixed">จำนวนเงิน (฿)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-600">
                    มูลค่าส่วนลด {form.type === "percent" ? "(%)" : "(฿)"}
                  </label>
                  <input
                    required
                    value={form.value}
                    onChange={updateForm("value")}
                    type="number"
                    min="1"
                    step="1"
                    placeholder={form.type === "percent" ? "เช่น 10" : "เช่น 50"}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-600">ระยะเวลา</label>
                <input
                  value={form.period}
                  onChange={updateForm("period")}
                  type="text"
                  placeholder="เช่น 01 ก.ค. – 31 ก.ค. 2026"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-600">สถานะเริ่มต้น</label>
                <select
                  value={form.status}
                  onChange={updateForm("status")}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="scheduled">รอเริ่มใช้</option>
                  <option value="active">ใช้งานอยู่</option>
                  <option value="expired">หมดอายุ</option>
                </select>
              </div>

              {formError && (
                <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{formError}</p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {saving
                    ? editingPromotion
                      ? "กำลังบันทึก..."
                      : "กำลังสร้าง..."
                    : editingPromotion
                    ? "บันทึกการแก้ไข"
                    : "สร้างโปรโมชั่น"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}