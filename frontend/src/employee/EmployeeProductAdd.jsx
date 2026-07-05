import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Bell, ArrowLeft, UploadCloud } from "lucide-react";
import EmployeeSidebar from "./EmployeeSidebar";

export default function EmployeeProductAdd() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    category: "ผัก",
    price: "",
    stock: "",
    description: "",
  });
  const [saved, setSaved] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: เชื่อมต่อ API เพิ่มสินค้าจริง
    setSaved(true);
    setTimeout(() => navigate("/employee/warehouse"), 900);
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
            <img src="https://i.pravatar.cc/64?img=5" alt="" className="h-8 w-8 rounded-full object-cover" />
            <div className="leading-tight">
              <p className="text-sm font-medium text-slate-800">พนักงาน</p>
              <p className="text-xs text-slate-400">Warehouse Staff</p>
            </div>
          </div>
        </div>

        <Link
          to="/employee/warehouse"
          className="mb-2 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-emerald-700"
        >
          <ArrowLeft size={15} />
          กลับไปหน้าคลังสินค้า
        </Link>

        <div>
          <h1 className="text-2xl font-semibold text-emerald-800">เพิ่มสินค้าใหม่</h1>
          <p className="mt-1 text-sm text-slate-400">กรอกรายละเอียดสินค้าเพื่อเพิ่มเข้าคลังสินค้า</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-xl border border-slate-100 bg-white p-6"
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-600">ชื่อสินค้า</label>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                placeholder="เช่น ข้าวหอมมะลิ 100%"
                value={form.name}
                onChange={update("name")}
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">หมวดหมู่</label>
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                value={form.category}
                onChange={update("category")}
              >
                <option>ผัก</option>
                <option>ผลไม้</option>
                <option>ข้าวและธัญพืช</option>
                <option>โปรตีน</option>
                <option>อื่น ๆ</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">ราคาต่อหน่วย (บาท)</label>
              <input
                type="number"
                min="0"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                placeholder="0.00"
                value={form.price}
                onChange={update("price")}
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">จำนวนคงเหลือ</label>
              <input
                type="number"
                min="0"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                placeholder="0"
                value={form.stock}
                onChange={update("stock")}
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">รูปภาพสินค้า</label>
              <div className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 px-4 py-6 text-center text-slate-400 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700">
                <UploadCloud size={22} className="mb-2" />
                <p className="text-sm">ลากไฟล์มาวาง หรือคลิกเพื่อเลือกรูปภาพ</p>
                <p className="mt-1 text-xs text-slate-400">รองรับ JPG, PNG ไม่เกิน 5MB</p>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-600">รายละเอียดสินค้า</label>
              <textarea
                rows={4}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                placeholder="อธิบายรายละเอียด แหล่งที่มา หรือวิธีการเก็บรักษา"
                value={form.description}
                onChange={update("description")}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
            <Link
              to="/employee/warehouse"
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              ยกเลิก
            </Link>
            <button
              type="submit"
              className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800"
            >
              {saved ? "บันทึกแล้ว ✓" : "บันทึกสินค้า"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}