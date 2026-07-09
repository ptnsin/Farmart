import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, X, User, Mail, Phone, Shield, Camera, Trash2, Loader2 } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import { addUser } from "../data/userStore";

const ROLES = ["EMPLOYEE", "CUSTOMER", "ADMIN"];
const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB ต้องตรงกับ limit ฝั่ง backend
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function AdminUserNew() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "EMPLOYEE",
    status: "active",
    avatar: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // ให้เลือกไฟล์เดิมซ้ำได้ในครั้งถัดไป
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setError("ขนาดรูปต้องไม่เกิน 2MB");
      return;
    }

    setError("");
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch(`${API_URL}/api/upload/avatar`, { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "อัปโหลดรูปไม่สำเร็จ");
      setForm((f) => ({ ...f, avatar: data.url }));
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "เชื่อมต่อ backend ไม่ได้ ตรวจสอบว่ารัน server ที่ " + API_URL + " อยู่หรือไม่"
          : err.message
      );
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = () => setForm((f) => ({ ...f, avatar: "" }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.email.trim()) {
      setError("กรุณากรอกชื่อ-นามสกุลและอีเมลให้ครบถ้วน");
      return;
    }

    setSaving(true);
    try {
      addUser(form);
      navigate("/admin/users");
    } catch {
      setError("บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto px-6 py-6 md:px-10">
        {/* Top bar */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">เพิ่มบัญชีผู้ใช้</h1>
            <p className="mt-1 text-sm text-slate-400">
              กรอกข้อมูลเพื่อสร้างบัญชีผู้ใช้งานใหม่ในระบบ Farmart
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/users")}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <X size={16} />
              ยกเลิก
            </button>
            <button
              type="submit"
              form="user-form"
              disabled={saving || uploading}
              className="flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
            >
              <Save size={16} />
              {saving ? "กำลังบันทึก..." : "บันทึกผู้ใช้"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 max-w-2xl rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {error}
          </div>
        )}

        <form id="user-form" onSubmit={handleSubmit} className="max-w-2xl">
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-800">
              <User size={18} className="text-emerald-600" />
              ข้อมูลทั่วไป
            </h2>

            <div className="mt-4 flex items-center gap-4">
              <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50">
                {uploading ? (
                  <Loader2 size={22} className="animate-spin text-slate-300" />
                ) : form.avatar ? (
                  <img src={form.avatar} alt="รูปโปรไฟล์" className="h-full w-full object-cover" />
                ) : (
                  <User size={28} className="text-slate-300" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                  >
                    <Camera size={14} />
                    {uploading ? "กำลังอัปโหลด..." : form.avatar ? "เปลี่ยนรูป" : "อัปโหลดรูปโปรไฟล์"}
                  </button>
                  {form.avatar && !uploading && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      aria-label="ลบรูปโปรไฟล์"
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <p className="mt-1.5 text-xs text-slate-400">รองรับไฟล์ JPG, PNG ขนาดไม่เกิน 2MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-slate-600">ชื่อ-นามสกุล</label>
                <input
                  required
                  value={form.name}
                  onChange={update("name")}
                  type="text"
                  placeholder="เช่น กัญญา วนาวรรณ"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">บทบาท</label>
                <select
                  value={form.role}
                  onChange={update("role")}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 flex items-center gap-1.5 text-sm text-slate-600">
                  <Mail size={14} className="text-slate-400" />
                  อีเมล
                </label>
                <input
                  required
                  value={form.email}
                  onChange={update("email")}
                  type="email"
                  placeholder="name@email.com"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <div>
                <label className="mb-1 flex items-center gap-1.5 text-sm text-slate-600">
                  <Phone size={14} className="text-slate-400" />
                  เบอร์โทรศัพท์
                </label>
                <input
                  value={form.phone}
                  onChange={update("phone")}
                  type="tel"
                  placeholder="081-234-5678"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-800">
              <Shield size={18} className="text-emerald-600" />
              สถานะบัญชี
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              กำหนดว่าบัญชีนี้จะสามารถเข้าใช้งานระบบได้ทันทีหรือไม่
            </p>

            <div className="mt-4 flex gap-3">
              <label
                className={`flex flex-1 cursor-pointer items-center gap-2 rounded-lg border px-4 py-3 text-sm ${
                  form.status === "active"
                    ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 text-slate-500"
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value="active"
                  checked={form.status === "active"}
                  onChange={update("status")}
                  className="accent-emerald-600"
                />
                ใช้งานอยู่
              </label>
              <label
                className={`flex flex-1 cursor-pointer items-center gap-2 rounded-lg border px-4 py-3 text-sm ${
                  form.status === "suspended"
                    ? "border-rose-300 bg-rose-50 text-rose-600"
                    : "border-slate-200 text-slate-500"
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value="suspended"
                  checked={form.status === "suspended"}
                  onChange={update("status")}
                  className="accent-rose-500"
                />
                ระงับการใช้งาน
              </label>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}