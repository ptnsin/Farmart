import { useState } from "react";
import {
  ClipboardCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
} from "lucide-react";
import AdminSidebar from "./AdminSidebar";

const CHANGE_TYPE = {
  add: { label: "เพิ่มสินค้าใหม่", icon: Plus, color: "text-emerald-600 bg-emerald-50" },
  edit: { label: "แก้ไขข้อมูลสินค้า", icon: Pencil, color: "text-amber-600 bg-amber-50" },
  remove: { label: "ลบสินค้า", icon: Trash2, color: "text-rose-600 bg-rose-50" },
};

const REQUESTS = [
  {
    id: 1,
    type: "add",
    product: "น้ำผึ้งดอกลำไย ตรากิ่งแก้ว",
    farmer: "สวนกิ่งแก้ว, เชียงราย",
    submittedAt: "05 ก.ค. 2026",
    detail: "เพิ่มสินค้าใหม่ หมวดหมู่ผลิตภัณฑ์แปรรูป ราคาตั้งขาย 245 บาท สต็อกเริ่มต้น 80 หน่วย",
  },
  {
    id: 2,
    type: "edit",
    product: "ข้าวหอมมะลิ ปทุมทาน",
    farmer: "เพชรบัตร, สวนอาม่าตร",
    submittedAt: "05 ก.ค. 2026",
    detail: "แก้ไขราคาขายจาก 32.99 บาท เป็น 34.99 บาท และปรับคำอธิบายสินค้าใหม่",
  },
  {
    id: 3,
    type: "remove",
    product: "ผักกาดขาวออร์แกนิก (ล็อตเก่า)",
    farmer: "แสงฟาร์มอินทรีย์",
    submittedAt: "04 ก.ค. 2026",
    detail: "ขอลบสินค้าเนื่องจากหมดฤดูเก็บเกี่ยวและไม่มีสต็อกคงเหลือ",
  },
];

const STATS = [
  { key: "pending", label: "รอตรวจสอบ", value: REQUESTS.length, icon: Clock, iconBg: "bg-amber-50", iconColor: "text-amber-600" },
  { key: "approved", label: "อนุมัติวันนี้", value: 9, icon: CheckCircle2, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
  { key: "rejected", label: "ปฏิเสธวันนี้", value: 2, icon: XCircle, iconBg: "bg-rose-50", iconColor: "text-rose-600" },
];

function StatCard({ label, value, icon: Icon, iconBg, iconColor }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className={`flex h-11 w-11 items-center justify-center rounded-full ${iconBg} ${iconColor}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs font-medium tracking-wide text-slate-400">{label}</p>
        <p className="text-2xl font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

export default function AdminProductApprovals() {
  const [expanded, setExpanded] = useState(null);
  const [requests, setRequests] = useState(REQUESTS);

  const resolve = (id) => setRequests((prev) => prev.filter((r) => r.id !== id));

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto px-6 py-6 md:px-10">
        <div className="mb-8 flex items-center gap-2 text-emerald-700">
          <ClipboardCheck size={20} />
          <h1 className="text-2xl font-semibold text-slate-800">อนุมัติการจัดการสินค้า</h1>
        </div>
        <p className="-mt-6 mb-6 text-sm text-slate-400">
          ตรวจสอบคำขอเพิ่ม แก้ไข และลบสินค้าที่เกษตรกรส่งเข้ามา ก่อนเผยแพร่ในหน้าร้าน
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {STATS.map((s) => (
            <StatCard key={s.key} {...s} />
          ))}
        </div>

        <div className="mt-6 space-y-3">
          {requests.map((req) => {
            const meta = CHANGE_TYPE[req.type];
            const Icon = meta.icon;
            const isOpen = expanded === req.id;
            return (
              <div key={req.id} className="rounded-xl border border-slate-100 bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : req.id)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <div className="flex items-center gap-4">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-full ${meta.color}`}>
                      <Icon size={16} />
                    </span>
                    <div>
                      <p className="font-medium text-slate-800">{req.product}</p>
                      <p className="text-xs text-slate-400">
                        {meta.label} · {req.farmer} · {req.submittedAt}
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-slate-400 transition ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-slate-100 px-5 py-4">
                    <p className="text-sm text-slate-600">{req.detail}</p>
                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => resolve(req.id)}
                        className="rounded-full border border-rose-200 px-4 py-1.5 text-sm font-medium text-rose-500 hover:bg-rose-50"
                      >
                        ปฏิเสธ
                      </button>
                      <button
                        type="button"
                        onClick={() => resolve(req.id)}
                        className="rounded-full bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
                      >
                        อนุมัติ
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {requests.length === 0 && (
            <div className="rounded-xl border border-slate-100 bg-white p-10 text-center text-sm text-slate-400 shadow-sm">
              ไม่มีคำขอที่รอตรวจสอบในขณะนี้
            </div>
          )}
        </div>
      </main>
    </div>
  );
}