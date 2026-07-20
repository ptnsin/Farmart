import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImagePlus, X, ChevronLeft } from "lucide-react";
import EmployeeSidebar from "./EmployeeSidebar";
import { addProduct } from "../data/productStore";
import { api } from "../data/apiClient";
import EmployeeTopBar from "./EmployeeTopBar";

// รายการหมวดหมู่ตามข้อมูลสินค้าจริงในระบบ (ร้านขายอุปกรณ์การเกษตร ไม่ใช่พืชผักสด)
const CATEGORIES = [
  "เมล็ดพันธุ์",
  "ฮอร์โมน",
  "ปุ๋ย",
  "อุปกรณ์จัดการดิน",
  "อุปกรณ์รดน้ำ",
  "กระถาง",
];

export default function EmployeeProductAdd() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [form, setForm] = useState({
    name: "",
    category: CATEGORIES[0],
    unit: "",
    stock: "",
    price: "",
    cost: "",
    farmer: "",
    location: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saveError, setSaveError] = useState("");

  const handleField = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleImageChange = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleFileInput = (e) => {
    handleImageChange(e.target.files?.[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleImageChange(e.dataTransfer.files?.[0]);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError("");
    setSaving(true);
    try {
      let imageUrl;
      if (imageFile) {
        setUploading(true);
        try {
          const formData = new FormData();
          formData.append("file", imageFile);
          const uploadResult = await api.post("/api/upload/product", formData);
          imageUrl = uploadResult.url;
        } catch (err) {
          setSaveError(err.message || "อัปโหลดรูปภาพไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
          setSaving(false);
          setUploading(false);
          return;
        }
        setUploading(false);
      }

      // backend จะตั้งสถานะ approvalStatus เป็น pending ให้เองสำหรับสินค้าที่พนักงานเพิ่ม
      await addProduct({
        name: form.name,
        category: form.category,
        unit: form.unit || "หน่วย",
        price: Number(form.price),
        cost: form.cost ? Number(form.cost) : undefined,
        stockUnits: Number(form.stock),
        farmer: form.farmer,
        location: form.location,
        description: form.description,
        ...(imageUrl ? { image: imageUrl, images: [imageUrl] } : {}),
      });
      navigate("/employee/warehouse");
    } catch (err) {
      setSaveError(err.message || "บันทึกสินค้าไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <EmployeeSidebar />

      <main className="flex-1 overflow-y-auto px-6 py-6 md:px-10">
        <EmployeeTopBar />

        {/* Heading */}
        <button
          type="button"
          onClick={() => navigate("/employee/warehouse")}
          className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ChevronLeft size={16} />
          กลับไปหน้าคลังสินค้า
        </button>
        <div className="mt-3">
          <h1 className="text-2xl font-semibold text-emerald-800">เพิ่มสินค้าใหม่</h1>
          <p className="mt-1 text-sm text-slate-400">
            กรอกรายละเอียดสินค้าและอัปโหลดรูปภาพเพื่อเพิ่มลงในคลังสินค้า
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3"
        >
          {/* Image upload */}
          <div className="rounded-xl border border-slate-100 bg-white p-5 lg:col-span-1">
            <p className="mb-3 text-sm font-medium text-slate-700">รูปภาพสินค้า</p>

            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="พรีวิวสินค้า"
                  className="h-56 w-full rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  aria-label="ลบรูปภาพ"
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/60 text-white hover:bg-slate-900/80"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="flex h-56 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 text-center hover:border-emerald-300 hover:bg-emerald-50/40"
              >
                <ImagePlus size={28} className="text-slate-400" />
                <p className="text-sm font-medium text-slate-600">
                  ลากรูปมาวาง หรือคลิกเพื่อเลือกไฟล์
                </p>
                <p className="text-xs text-slate-400">PNG, JPG ขนาดไม่เกิน 5MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </label>
            )}

            {imagePreview && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 w-full rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                เปลี่ยนรูปภาพ
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </button>
            )}
          </div>

          {/* Fields */}
          <div className="rounded-xl border border-slate-100 bg-white p-5 lg:col-span-2">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  ชื่อสินค้า
                </label>
                <input
                  required
                  value={form.name}
                  onChange={handleField("name")}
                  type="text"
                  placeholder="เช่น ข้าวหอมมะลิ 100%"
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  หมวดหมู่
                </label>
                <select
                  value={form.category}
                  onChange={handleField("category")}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  หน่วยนับ
                </label>
                <input
                  value={form.unit}
                  onChange={handleField("unit")}
                  type="text"
                  placeholder="เช่น ซอง, ขวด, ถุง 25 กก."
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  ราคาต่อหน่วย (บาท)
                </label>
                <input
                  required
                  value={form.price}
                  onChange={handleField("price")}
                  type="number"
                  min="0"
                  placeholder="0.00"
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  ต้นทุนต่อหน่วย (บาท)
                </label>
                <input
                  value={form.cost}
                  onChange={handleField("cost")}
                  type="number"
                  min="0"
                  placeholder="0.00 (ไม่บังคับ)"
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  จำนวนคงเหลือ
                </label>
                <input
                  required
                  value={form.stock}
                  onChange={handleField("stock")}
                  type="number"
                  min="0"
                  placeholder="0"
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  ผู้จำหน่าย
                </label>
                <input
                  value={form.farmer}
                  onChange={handleField("farmer")}
                  type="text"
                  placeholder="ชื่อผู้ผลิตหรือผู้จำหน่าย"
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  แหล่งผลิต
                </label>
                <input
                  value={form.location}
                  onChange={handleField("location")}
                  type="text"
                  placeholder="เช่น เชียงใหม่"
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  รายละเอียดสินค้า
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={handleField("description")}
                  placeholder="อธิบายรายละเอียดสินค้า"
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>

            {saveError && <p className="mt-4 text-sm text-rose-500">{saveError}</p>}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/employee/warehouse")}
                disabled={saving}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
              >
                {uploading ? "กำลังอัปโหลดรูป..." : saving ? "กำลังบันทึก..." : "บันทึกสินค้า"}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}