import { useMemo, useState } from "react";
import {
  Search,
  Bell,
  ClipboardCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  Package,
  Check,
  X,
} from "lucide-react";
import AdminSidebar from "./AdminSidebar";

const CHANGE_TYPE = {
  add: { label: "เพิ่มสินค้าใหม่", icon: Plus, color: "text-emerald-600 bg-emerald-50" },
  edit: { label: "แก้ไขข้อมูลสินค้า", icon: Pencil, color: "text-amber-600 bg-amber-50" },
  remove: { label: "ลบสินค้า", icon: Trash2, color: "text-rose-600 bg-rose-50" },
};

// 1 "รายการที่รออนุมัติ" (batch) = พนักงาน 1 คน จัดสินค้ามาส่งครั้งเดียว
// อาจมีสินค้าหลายชิ้นอยู่ในรายการเดียวกันได้
const BATCHES = [
  {
    id: 1,
    employeeId: "EMP-0231",
    employeeName: "สมชาย ใจดี",
    submittedAt: "05 ก.ค. 2026 · 14:20",
    items: [
      {
        id: 101,
        type: "add",
        product: "น้ำผึ้งดอกลำไย ตรากิ่งแก้ว",
        detail: "เพิ่มสินค้าใหม่ หมวดหมู่ผลิตภัณฑ์แปรรูป ราคาตั้งขาย 245 บาท สต็อกเริ่มต้น 80 หน่วย",
      },
      {
        id: 102,
        type: "add",
        product: "น้ำผึ้งดอกทานตะวัน ตรากิ่งแก้ว",
        detail: "เพิ่มสินค้าใหม่ หมวดหมู่ผลิตภัณฑ์แปรรูป ราคาตั้งขาย 260 บาท สต็อกเริ่มต้น 60 หน่วย",
      },
    ],
  },
  {
    id: 2,
    employeeId: "EMP-0114",
    employeeName: "พิมพ์ชนก แสงทอง",
    submittedAt: "05 ก.ค. 2026 · 10:05",
    items: [
      {
        id: 201,
        type: "edit",
        product: "ข้าวหอมมะลิ ปทุมทาน",
        detail: "แก้ไขราคาขายจาก 32.99 บาท เป็น 34.99 บาท และปรับคำอธิบายสินค้าใหม่",
      },
    ],
  },
  {
    id: 3,
    employeeId: "EMP-0075",
    employeeName: "อรุณ ศรีสุข",
    submittedAt: "04 ก.ค. 2026 · 16:40",
    items: [
      {
        id: 301,
        type: "remove",
        product: "ผักกาดขาวออร์แกนิก (ล็อตเก่า)",
        detail: "ขอลบสินค้าเนื่องจากหมดฤดูเก็บเกี่ยวและไม่มีสต็อกคงเหลือ",
      },
      {
        id: 302,
        type: "remove",
        product: "คะน้าใบเขียว (ล็อตเก่า)",
        detail: "ขอลบสินค้าเนื่องจากสภาพไม่ได้มาตรฐานคุณภาพ",
      },
    ],
  },
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
  const [batches, setBatches] = useState(BATCHES);
  const [query, setQuery] = useState("");
  const [approvedCount, setApprovedCount] = useState(9);
  const [rejectedCount, setRejectedCount] = useState(2);

  const filteredBatches = useMemo(() => {
    if (!query.trim()) return batches;
    const q = query.trim().toLowerCase();
    return batches.filter(
      (b) =>
        b.employeeName.toLowerCase().includes(q) ||
        b.employeeId.toLowerCase().includes(q) ||
        b.items.some((it) => it.product.toLowerCase().includes(q))
    );
  }, [batches, query]);

  const removeItem = (batchId, itemId) => {
    setBatches((prev) =>
      prev
        .map((b) =>
          b.id === batchId ? { ...b, items: b.items.filter((it) => it.id !== itemId) } : b
        )
        .filter((b) => b.items.length > 0)
    );
  };

  const approveItem = (batchId, itemId) => {
    removeItem(batchId, itemId);
    setApprovedCount((c) => c + 1);
  };

  const rejectItem = (batchId, itemId) => {
    removeItem(batchId, itemId);
    setRejectedCount((c) => c + 1);
  };

  const approveBatch = (batch) => {
    setApprovedCount((c) => c + batch.items.length);
    setBatches((prev) => prev.filter((b) => b.id !== batch.id));
    setExpanded(null);
  };

  const rejectBatch = (batch) => {
    setRejectedCount((c) => c + batch.items.length);
    setBatches((prev) => prev.filter((b) => b.id !== batch.id));
    setExpanded(null);
  };

  const STATS = [
    {
      id: "pending",
      label: "รอตรวจสอบ",
      value: batches.length,
      icon: Clock,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      id: "approved",
      label: "อนุมัติวันนี้",
      value: approvedCount,
      icon: CheckCircle2,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      id: "rejected",
      label: "ปฏิเสธวันนี้",
      value: rejectedCount,
      icon: XCircle,
      iconBg: "bg-rose-50",
      iconColor: "text-rose-600",
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto px-6 py-6 md:px-10">
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
              placeholder="ค้นหาด้วยชื่อพนักงาน, ไอดีพนักงาน หรือชื่อสินค้า..."
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

        <div className="mb-8 flex items-center gap-2 text-emerald-700">
          <ClipboardCheck size={20} />
          <h1 className="text-2xl font-semibold text-slate-800">อนุมัติการจัดการสินค้า</h1>
        </div>
        <p className="-mt-6 mb-6 text-sm text-slate-400">
          ตรวจสอบรายการที่พนักงานจัดสินค้าเข้ามา (เพิ่ม/แก้ไข/ลบ) ก่อนเผยแพร่ในหน้าร้าน
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {STATS.map((s) => (
            <StatCard key={s.id} {...s} />
          ))}
        </div>

        <div className="mt-6 space-y-3">
          {filteredBatches.map((batch) => {
            const isOpen = expanded === batch.id;
            return (
              <div key={batch.id} className="rounded-xl border border-slate-100 bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : batch.id)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <div className="flex items-center gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                      <Package size={16} />
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-slate-800">{batch.employeeName}</p>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                          {batch.employeeId}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        จัดเมื่อ {batch.submittedAt} · {batch.items.length} รายการ
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
                    <div className="space-y-3">
                      {batch.items.map((item) => {
                        const meta = CHANGE_TYPE[item.type];
                        const Icon = meta.icon;
                        return (
                          <div
                            key={item.id}
                            className="flex items-start justify-between gap-4 rounded-lg border border-slate-100 bg-slate-50/70 px-4 py-3"
                          >
                            <div className="flex items-start gap-3">
                              <span
                                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${meta.color}`}
                              >
                                <Icon size={14} />
                              </span>
                              <div>
                                <p className="text-sm font-medium text-slate-800">{item.product}</p>
                                <p className="text-xs text-slate-400">{meta.label}</p>
                                <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
                              </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              <button
                                type="button"
                                onClick={() => rejectItem(batch.id, item.id)}
                                aria-label="ปฏิเสธรายการนี้"
                                className="flex h-7 w-7 items-center justify-center rounded-full border border-rose-200 text-rose-500 hover:bg-rose-50"
                              >
                                <X size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => approveItem(batch.id, item.id)}
                                aria-label="อนุมัติรายการนี้"
                                className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
                              >
                                <Check size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                      <p className="text-xs text-slate-400">
                        พนักงานผู้จัด: {batch.employeeName} ({batch.employeeId})
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => rejectBatch(batch)}
                          className="rounded-full border border-rose-200 px-4 py-1.5 text-sm font-medium text-rose-500 hover:bg-rose-50"
                        >
                          ปฏิเสธทั้งหมด
                        </button>
                        <button
                          type="button"
                          onClick={() => approveBatch(batch)}
                          className="rounded-full bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
                        >
                          อนุมัติทั้งหมด
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filteredBatches.length === 0 && (
            <div className="rounded-xl border border-slate-100 bg-white p-10 text-center text-sm text-slate-400 shadow-sm">
              {batches.length === 0
                ? "ไม่มีรายการที่รอตรวจสอบในขณะนี้"
                : "ไม่พบรายการที่ตรงกับคำค้นหา"}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}