import { useState } from "react";
import {
  Info,
  Image as ImageIcon,
  CreditCard,
  Truck,
  Bold,
  Italic,
  List,
  Link2,
  Plus,
  Save,
  UploadCloud,
  MapPin,
  X,
} from "lucide-react";
import AdminSidebar from "./AdminSidebar";

const CATEGORY_OPTIONS = [
  "เมล็ดพันธุ์",
  "อุปกรณ์",
  "สารอาหาร",
  "ปุ๋ย",
  "เครื่องมือ",
];

function SectionCard({ icon: Icon, title, children, className = "" }) {
  return (
    <div className={`rounded-xl border border-slate-100 bg-white p-6 shadow-sm ${className}`}>
      <div className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
        <Icon size={16} className="text-emerald-700" />
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-500">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100";

export default function AdminProductNew() {
  const [form, setForm] = useState({
    name: "",
    category: "",
    sku: "AH-PROD-001",
    description: "",
    costPrice: "",
    sellPrice: "",
    stockQty: "0",
    lowStockAlert: "10",
    weight: "0.0",
    width: "",
    length: "",
    height: "",
    origin: "",
    coldChain: false,
  });
  const [tags, setTags] = useState(["Organic"]);
  const [images, setImages] = useState([
    "https://images.unsplash.com/photo-1524594227084-6dc4f8c19b74?w=200&h=200&fit=crop",
  ]);

  const update = (key) => (e) =>
    setForm((f) => ({
      ...f,
      [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  const removeTag = (tag) => setTags((t) => t.filter((x) => x !== tag));

  const handleSave = () => {
    console.log("บันทึกสินค้า:", { ...form, tags, images });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto px-6 py-6 md:px-8">
        {/* Top bar */}
        <div className="mb-8 flex items-center justify-end gap-4">
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

        {/* Heading + actions */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">เพิ่มสินค้าใหม่</h1>
            <p className="mt-1 text-sm text-slate-400">
              กรอกข้อมูลเพื่อลงทะเบียนสินค้าเกษตรใหม่ในระบบ
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              <Save size={16} />
              บันทึกสินค้า
            </button>
          </div>
        </div>

        {/* Form grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column */}
          <div className="space-y-6 lg:col-span-2">
            <SectionCard icon={Info} title="ข้อมูลทั่วไป">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="ชื่อสินค้า">
                  <input
                    value={form.name}
                    onChange={update("name")}
                    placeholder="เช่น ข้าวหอมมะลิ 105"
                    className={inputClass}
                  />
                </Field>
                <Field label="หมวดหมู่">
                  <select
                    value={form.category}
                    onChange={update("category")}
                    className={`${inputClass} text-slate-500`}
                  >
                    <option value="">เลือกหมวดหมู่</option>
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="รหัสสินค้า (SKU)">
                  <input
                    value={form.sku}
                    onChange={update("sku")}
                    className={inputClass}
                  />
                </Field>
                <Field label="ป้ายกำกับพิเศษ">
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700"
                      >
                        🌿 {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-emerald-500 hover:text-emerald-800"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    <button
                      type="button"
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:bg-slate-50"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </Field>
              </div>

              <div className="mt-4">
                <Field label="รายละเอียดสินค้า">
                  <div className="rounded-lg border border-slate-200">
                    <div className="flex items-center gap-3 border-b border-slate-100 px-3 py-2 text-slate-400">
                      <Bold size={14} />
                      <Italic size={14} />
                      <List size={14} />
                      <Link2 size={14} />
                    </div>
                    <textarea
                      value={form.description}
                      onChange={update("description")}
                      rows={4}
                      placeholder="บรรยายลักษณะสินค้า วิธีการปลูก และข้อควรระวัง..."
                      className="w-full resize-none rounded-b-lg px-3 py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </Field>
              </div>
            </SectionCard>

            <SectionCard icon={CreditCard} title="ราคาและสต็อก">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="ราคาต้นทุน (บาท)">
                  <input
                    type="number"
                    value={form.costPrice}
                    onChange={update("costPrice")}
                    placeholder="0.00"
                    className={inputClass}
                  />
                </Field>
                <Field label="ราคาขาย (บาท)">
                  <input
                    type="number"
                    value={form.sellPrice}
                    onChange={update("sellPrice")}
                    placeholder="0.00"
                    className={inputClass}
                  />
                </Field>
                <Field label="จำนวนสินค้าคงเหลือ">
                  <input
                    type="number"
                    value={form.stockQty}
                    onChange={update("stockQty")}
                    className={inputClass}
                  />
                </Field>
                <Field label="แจ้งเตือนเมื่อสต็อกต่ำกว่า">
                  <input
                    type="number"
                    value={form.lowStockAlert}
                    onChange={update("lowStockAlert")}
                    className={inputClass}
                  />
                </Field>
              </div>
            </SectionCard>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <SectionCard icon={ImageIcon} title="รูปภาพสินค้า">
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-200 px-4 py-8 text-center hover:border-emerald-300 hover:bg-emerald-50/30">
                <input type="file" accept="image/*" multiple className="hidden" />
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <UploadCloud size={18} />
                </div>
                <p className="text-xs text-slate-500">
                  ลากและวางรูปภาพ
                  <br />
                  หรือคลิกเพื่อเลือกไฟล์ (รองรับ
                  <br />
                  JPG, PNG สูงสุด 5MB)
                </p>
              </label>

              <div className="mt-4 flex gap-2">
                {images.map((src, i) => (
                  <div
                    key={i}
                    className="h-14 w-14 overflow-hidden rounded-lg border border-slate-100"
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
                <button
                  type="button"
                  className="flex h-14 w-14 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50"
                >
                  <Plus size={16} />
                </button>
                <button
                  type="button"
                  className="flex h-14 w-14 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50"
                >
                  <Plus size={16} />
                </button>
              </div>
            </SectionCard>

            <SectionCard icon={Truck} title="การจัดส่งและแหล่งที่มา">
              <Field label="น้ำหนัก (กก.)">
                <input
                  type="number"
                  value={form.weight}
                  onChange={update("weight")}
                  className={inputClass}
                />
              </Field>

              <div className="mt-4">
                <span className="mb-1.5 block text-xs font-medium text-slate-500">
                  ขนาดสินค้า (ก x ย x ส) ซม.
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    value={form.width}
                    onChange={update("width")}
                    placeholder="กว้าง"
                    className={inputClass}
                  />
                  <input
                    value={form.length}
                    onChange={update("length")}
                    placeholder="ยาว"
                    className={inputClass}
                  />
                  <input
                    value={form.height}
                    onChange={update("height")}
                    placeholder="สูง"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="mt-4">
                <Field label="แหล่งที่มา / ฟาร์ม">
                  <div className="relative">
                    <MapPin
                      size={16}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      value={form.origin}
                      onChange={update("origin")}
                      placeholder="เช่น จ.เชียงราย หรือ ฟาร์มไพร"
                      className={`${inputClass} pl-9`}
                    />
                  </div>
                </Field>
              </div>

              <label className="mt-4 flex items-start gap-2 text-xs text-slate-500">
                <input
                  type="checkbox"
                  checked={form.coldChain}
                  onChange={update("coldChain")}
                  className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-400"
                />
                สินค้านี้ต้องใช้การขนส่งแบบควบคุมอุณหภูมิ
              </label>
            </SectionCard>
          </div>
        </div>
      </main>
    </div>
  );
}