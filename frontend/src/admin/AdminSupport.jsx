import { useState } from "react";
import {
  LifeBuoy,
  Phone,
  Mail,
  MessageCircle,
  ChevronDown,
  Send,
  Clock,
  CheckCircle2,
} from "lucide-react";
import AdminSidebar from "./AdminSidebar";

const CONTACT_CHANNELS = [
  {
    key: "phone",
    label: "โทรศัพท์",
    value: "02-123-4567",
    hint: "จันทร์–ศุกร์ 08:30–18:00 น.",
    icon: Phone,
  },
  {
    key: "email",
    label: "อีเมล",
    value: "support@Farmart.co.th",
    hint: "ตอบกลับภายใน 24 ชั่วโมง",
    icon: Mail,
  },
  {
    key: "line",
    label: "LINE Official",
    value: "@Farmart",
    hint: "แชทได้ทุกวัน 09:00–21:00 น.",
    icon: MessageCircle,
  },
];

const FAQS = [
  {
    q: "จะอนุมัติสินค้าที่เกษตรกรส่งเข้ามาได้อย่างไร",
    a: "ไปที่เมนู “อนุมัติสินค้า” เลือกรายการที่ต้องการตรวจสอบ กดเพื่อดูรายละเอียด แล้วเลือกอนุมัติหรือปฏิเสธได้ทันที",
  },
  {
    q: "จะระงับการใช้งานบัญชีผู้ใช้ได้อย่างไร",
    a: "ไปที่เมนู “ผู้ใช้งาน” หาผู้ใช้ที่ต้องการ แล้วกดไอคอนแก้ไขเพื่อเปลี่ยนสถานะเป็นถูกระงับ",
  },
  {
    q: "โปรโมชั่นที่สร้างแล้วแก้ไขทีหลังได้ไหม",
    a: "ได้ ไปที่เมนู “โปรโมชั่น/ส่วนลด” แล้วกดไอคอนแก้ไขที่แถวของโปรโมชั่นนั้น",
  },
];

const TICKETS = [
  { id: "#SP-1042", subject: "ไม่สามารถอัปโหลดรูปสินค้าได้", status: "open", date: "04 ก.ค. 2026" },
  { id: "#SP-1039", subject: "สอบถามขั้นตอนอนุมัติสินค้า", status: "resolved", date: "02 ก.ค. 2026" },
];

export default function AdminSupport() {
  const [openFaq, setOpenFaq] = useState(null);
  const [form, setForm] = useState({ subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setForm({ subject: "", message: "" });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto px-6 py-6 md:px-10">
        <div className="flex items-center gap-2 text-emerald-700">
          <LifeBuoy size={20} />
          <h1 className="text-2xl font-semibold text-slate-800">Support</h1>
        </div>
        <p className="mt-1 text-sm text-slate-400">
          ติดต่อทีมสนับสนุน ดูคำถามที่พบบ่อย หรือติดตามคำร้องที่ส่งไปแล้ว
        </p>

        {/* Contact channels */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {CONTACT_CHANNELS.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.key} className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Icon size={18} />
                </div>
                <p className="mt-3 text-xs font-medium tracking-wide text-slate-400">{c.label}</p>
                <p className="text-base font-semibold text-slate-800">{c.value}</p>
                <p className="mt-0.5 text-xs text-slate-400">{c.hint}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Contact form */}
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-800">ส่งคำร้องถึงทีมสนับสนุน</h2>

            {sent && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <CheckCircle2 size={16} />
                ส่งคำร้องเรียบร้อยแล้ว ทีมงานจะติดต่อกลับโดยเร็วที่สุด
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm text-slate-600">หัวข้อ</label>
                <input
                  required
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  type="text"
                  placeholder="เช่น ปัญหาการอัปโหลดรูปสินค้า"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">รายละเอียด</label>
                <textarea
                  required
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  rows={5}
                  placeholder="อธิบายปัญหาที่พบให้ละเอียดที่สุด..."
                  className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
              >
                <Send size={16} />
                ส่งคำร้อง
              </button>
            </form>
          </div>

          <div className="space-y-6">
            {/* FAQ */}
            <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-800">คำถามที่พบบ่อย</h2>
              <div className="mt-3 space-y-2">
                {FAQS.map((faq, i) => {
                  const isOpen = openFaq === i;
                  return (
                    <div key={i} className="rounded-lg border border-slate-100">
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : i)}
                        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-slate-700"
                      >
                        {faq.q}
                        <ChevronDown
                          size={14}
                          className={`shrink-0 text-slate-400 transition ${isOpen ? "rotate-180" : ""}`}
                        />
                      </button>
                      {isOpen && (
                        <p className="border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
                          {faq.a}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent tickets */}
            <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-800">คำร้องล่าสุดของคุณ</h2>
              <div className="mt-3 space-y-3">
                {TICKETS.map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{t.subject}</p>
                      <p className="text-xs text-slate-400">
                        {t.id} · {t.date}
                      </p>
                    </div>
                    <span
                      className={`flex items-center gap-1.5 whitespace-nowrap text-xs font-medium ${
                        t.status === "open" ? "text-amber-600" : "text-emerald-600"
                      }`}
                    >
                      {t.status === "open" ? <Clock size={12} /> : <CheckCircle2 size={12} />}
                      {t.status === "open" ? "กำลังดำเนินการ" : "แก้ไขแล้ว"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}