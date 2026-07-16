import { useEffect, useMemo, useState } from "react";
import { Search, Bell, LifeBuoy, ChevronDown } from "lucide-react";
import EmployeeSidebar from "./EmployeeSidebar";
import { getCachedUser, fetchCurrentUser } from "../data/authStore";
import { api } from "../data/apiClient";

const FAQS = [
  {
    q: "จะอนุมัติคำสั่งซื้อได้อย่างไร?",
    a: "ไปที่หน้าคำสั่งซื้อ เลือกคำสั่งซื้อที่มีสถานะ \"รอดำเนินการ\" แล้วกดปุ่มเครื่องหมายถูกเพื่ออนุมัติ หรือกดปุ่มกากบาทเพื่อปฏิเสธ",
  },
  {
    q: "เพิ่มหรือแก้ไขสินค้าในคลังได้ที่ไหน?",
    a: "ไปที่หน้าคลังสินค้า กดปุ่ม \"เพิ่มสินค้า\" ที่มุมขวาบนเพื่อเพิ่มสินค้าใหม่ หรือกดไอคอนดินสอในตารางสินค้าเพื่อแก้ไขสินค้าที่มีอยู่แล้ว",
  },
  {
    q: "อัปเดตสถานะการขนส่งอย่างไร?",
    a: "ไปที่หน้าการขนส่ง แล้วกดปุ่ม \"อัปเดตสถานะ\" ในแถวของพัสดุนั้น ๆ ระบบจะเปลี่ยนสถานะไปยังขั้นตอนถัดไปโดยอัตโนมัติ",
  },
  {
    q: "ลืมรหัสผ่านต้องทำอย่างไร?",
    a: "ไปที่หน้าตั้งค่า แล้วกรอกรหัสผ่านใหม่ในช่อง \"รหัสผ่านใหม่\" หากเข้าสู่ระบบไม่ได้ กรุณาติดต่อทีมงานผ่านแบบฟอร์มด้านล่าง",
  },
];

export default function EmployeeSupport() {
  const [user, setUser] = useState(getCachedUser());
  const [openIdx, setOpenIdx] = useState(0);
  const [faqQuery, setFaqQuery] = useState("");
  const [form, setForm] = useState({ subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  useEffect(() => {
    fetchCurrentUser().then(setUser).catch(() => {});
  }, []);

  const filteredFaqs = useMemo(() => {
    const q = faqQuery.trim().toLowerCase();
    if (!q) return FAQS;
    return FAQS.filter(
      (item) => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
    );
  }, [faqQuery]);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSendError("");
    setSending(true);
    try {
      await api.post("/api/support", { subject: form.subject, message: form.message });
      setSent(true);
      setForm({ subject: "", message: "" });
      setTimeout(() => setSent(false), 3000);
    } catch (err) {
      setSendError(err.message || "ส่งคำร้องไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSending(false);
    }
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
              value={faqQuery}
              onChange={(e) => setFaqQuery(e.target.value)}
              placeholder="ค้นหาคำถามที่พบบ่อย..."
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
            <img src={user?.avatar || "https://i.pravatar.cc/64?img=5"} alt="" className="h-8 w-8 rounded-full object-cover" />
            <div className="leading-tight">
              <p className="text-sm font-medium text-slate-800">{user?.name || "พนักงาน"}</p>
              <p className="text-xs text-slate-400">Warehouse Staff</p>
            </div>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-semibold text-emerald-800">Support</h1>
          <p className="mt-1 text-sm text-slate-400">คำถามที่พบบ่อย และช่องทางติดต่อทีมงาน</p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="overflow-hidden rounded-xl border border-slate-100 bg-white">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-base font-semibold text-slate-800">คำถามที่พบบ่อย</h2>
            </div>
            {filteredFaqs.length === 0 ? (
              <p className="px-6 py-6 text-center text-sm text-slate-400">
                ไม่พบคำถามที่ตรงกับการค้นหา
              </p>
            ) : (
              filteredFaqs.map((item, idx) => (
                <div key={item.q} className="border-b border-slate-50 last:border-0">
                  <button
                    type="button"
                    onClick={() => setOpenIdx(openIdx === idx ? -1 : idx)}
                    className="flex w-full items-center justify-between px-6 py-4 text-left text-sm font-medium text-slate-800"
                  >
                    {item.q}
                    <ChevronDown
                      size={16}
                      className={`text-slate-400 transition-transform ${openIdx === idx ? "rotate-180" : ""}`}
                    />
                  </button>
                  {openIdx === idx && (
                    <p className="px-6 pb-4 text-sm leading-relaxed text-slate-500">{item.a}</p>
                  )}
                </div>
              ))
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-slate-100 bg-white p-6"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <LifeBuoy size={20} />
              </div>
              <h2 className="text-base font-semibold text-slate-800">ติดต่อทีมงาน</h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-600">หัวข้อ</label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  placeholder="เช่น ไม่สามารถอนุมัติคำสั่งซื้อได้"
                  value={form.subject}
                  onChange={update("subject")}
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-600">รายละเอียด</label>
                <textarea
                  rows={5}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  placeholder="อธิบายปัญหาที่พบโดยละเอียด"
                  value={form.message}
                  onChange={update("message")}
                  required
                />
              </div>
            </div>

            {sendError && <p className="mt-4 text-sm text-rose-500">{sendError}</p>}

            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
              <span className="text-sm text-emerald-600">
                {sent ? "ส่งคำร้องเรียบร้อยแล้ว ทีมงานจะติดต่อกลับเร็ว ๆ นี้" : ""}
              </span>
              <button
                type="submit"
                disabled={sending}
                className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
              >
                {sending ? "กำลังส่ง..." : "ส่งคำร้อง"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}