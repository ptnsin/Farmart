import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, ImagePlus, X, ChevronLeft } from "lucide-react";
import EmployeeSidebar from "./EmployeeSidebar";

const CATEGORIES = ["ข้าวและธัญพืช", "ผลไม้", "ผัก", "โปรตีน"];

export default function EmployeeProductAdd() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [form, setForm] = useState({
    name: "",
    category: CATEGORIES[0],
    stock: "",
    price: "",
  });

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

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: ส่ง form + imageFile ไปยัง API คลังสินค้าจริง (multipart/form-data)
    console.log("New product:", { ...form, image: imageFile });
    navigate("/employee/warehouse");
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

              <div className="sm:col-span-2">
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
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/employee/warehouse")}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-800"
              >
                บันทึกสินค้า
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}