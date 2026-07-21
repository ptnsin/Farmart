import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Bell,
  Package,
  AlertTriangle,
  UserPlus,
  BarChart3,
  ShoppingBag,
  Trash2,
  ChevronDown,
  MessageCircle,
} from "lucide-react";
import {
  getNotifications,
  subscribeNotifications,
  markAllAsRead,
  markAsRead,
  deleteNotification,
  formatRelativeTime,
} from "../data/notificationStore";

const TYPE_META = {
  pendingApproval: {
    icon: Package,
    bg: "bg-amber-50",
    color: "text-amber-600",
    label: "สินค้าใหม่",
  },
  lowStock: {
    icon: AlertTriangle,
    bg: "bg-rose-50",
    color: "text-rose-600",
    label: "สต็อกต่ำ",
  },
  newUser: {
    icon: UserPlus,
    bg: "bg-blue-50",
    color: "text-blue-600",
    label: "ผู้ใช้ใหม่",
  },
  weeklyReport: {
    icon: BarChart3,
    bg: "bg-emerald-50",
    color: "text-emerald-600",
    label: "รายงานประจำสัปดาห์",
  },
  newOrder: {
    icon: ShoppingBag,
    bg: "bg-indigo-50",
    color: "text-indigo-600",
    label: "คำสั่งซื้อใหม่",
  },
  // แจ้งเตือนจากลูกค้าโดยตรง (ทักมา/แจ้งปัญหา) แยกออกจากงานอนุมัติของพนักงานอย่างชัดเจน
  customerSupport: {
    icon: MessageCircle,
    bg: "bg-cyan-50",
    color: "text-cyan-600",
    label: "ปัญหาจากลูกค้า",
  },
};

// บาง record ตอนนี้ backend ยังส่ง n.type มาปนกัน (เช่น แจ้งปัญหาจากลูกค้าดันได้ type
// "pendingApproval" มาด้วย) เลยเช็คจาก "เนื้อหาจริง" ก่อนเป็นอันดับแรก ถ้าเข้าข่ายเรื่องจากลูกค้า
// (มีคำว่า "ลูกค้า"/"ปัญหา"/"ร้องเรียน" หรือ pattern "ชื่อผู้ใช้ ส่งข้อความ") ให้ตีเป็นหมวด
// customerSupport เสมอ ไม่ว่า type ที่ backend ส่งมาจะเป็นอะไร กันบัตรป้ายผิดหมวดแบบในภาพ
function resolveTypeMeta(n) {
  const text = `${n.title || ""} ${n.message || n.description || ""}`;
  const looksLikeCustomerIssue =
    /ลูกค้า|ปัญหา|ร้องเรียน|ส่งข้อความ/.test(text);
  if (looksLikeCustomerIssue) return TYPE_META.customerSupport;
  return TYPE_META[n.type] || TYPE_META.newOrder;
}

// จับข้อความที่อยู่ในเครื่องหมายคำพูด " " เพื่อแยกเป็น "ใจความหลัก" (เช่น ชื่อสินค้า/ชื่อผู้ใช้)
// ออกจาก "ส่วนขยาย/บริบท" รอบๆ เพื่อโชว์เป็นชิปเน้นสี แยกจากข้อความปกติ
// คืนค่าเป็น array ของ segment: { type: "text" | "highlight", value }
function parseMessageSegments(text) {
  if (!text) return [];

  // เคสข้อความจากลูกค้า เช่น 'ShiBas0happy ส่งข้อความ: sssssssss - sssssssssssss'
  // ไฮไลต์ชื่อผู้ส่งแยกออกมาให้เห็นชัดว่า "ใครทัก" ก่อนตามด้วยเนื้อหาที่ส่งมา
  const customerMsgMatch = text.match(/^(.+?)\s*ส่งข้อความ\s*[:：]?\s*([\s\S]*)$/);
  if (customerMsgMatch) {
    const [, sender, body] = customerMsgMatch;
    const segments = [{ type: "highlight", value: sender.trim() }];
    segments.push({ type: "text", value: ` ส่งข้อความ: ${body}` });
    return segments;
  }

  const segments = [];
  const regex = /"([^"]+)"/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    segments.push({ type: "highlight", value: match[1] });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }
  return segments;
}

/**
 * การ์ดแจ้งเตือนแต่ละอัน แยกเป็น component ย่อยเพื่อวัดว่าข้อความยาวเกิน 2 บรรทัด
 * (scrollHeight > clientHeight) จริงหรือไม่ ตอน mount ครั้งแรก (ตอนนั้นยังไม่ expand แน่นอน)
 * ถ้าไม่ยาวเกินก็จะไม่โชว์ปุ่ม "อ่านเพิ่มเติม" เลย กันดูรกตอนข้อความสั้นอยู่แล้ว
 *
 * Layout ใหม่แบ่งเป็นส่วนๆ ตามลำดับความสำคัญ:
 *  1) หัวเรื่อง (title) + จุดสถานะยังไม่อ่าน
 *  2) แท็กหมวดหมู่ (label สั้นๆ ตามประเภทแจ้งเตือน) — ส่วน "หลัก" บอกว่าเรื่องนี้เกี่ยวกับอะไร
 *  3) ข้อความรายละเอียด (message) — ส่วน "ย่อย" ขยายความ โดยไฮไลต์คำในเครื่องหมายคำพูด
 *     ให้เด่นขึ้นมาเป็นชิป เพื่อให้กวาดสายตาหาชื่อสินค้า/ผู้ใช้ได้เร็ว
 *  4) เวลา + ปุ่มอ่านเพิ่มเติม/ย่อ
 */
function NotificationItem({ n, isExpanded, onItemClick, onDelete }) {
  const textRef = useRef(null);
  const [isTruncatable, setIsTruncatable] = useState(false);
  const meta = resolveTypeMeta(n);
  const Icon = meta.icon;
  // backend ส่งมาเป็น field "message" (ดู notificationModel.js) ใส่ fallback
  // n.description ไว้เผื่อ record เก่าบางตัวเคยถูกสร้างด้วยชื่อ field นี้
  const fullText = n.message || n.description || "";
  const segments = parseMessageSegments(fullText);

  useLayoutEffect(() => {
    const el = textRef.current;
    if (el) {
      setIsTruncatable(el.scrollHeight > el.clientHeight + 1);
    }
    // วัดแค่ตอน mount / ตอนข้อความเปลี่ยน ไม่ต้องวัดซ้ำตอน toggle expand
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullText]);

  return (
    <div
      onClick={() => onItemClick(n.id)}
      className="group flex cursor-pointer items-start gap-3 px-4 py-3 hover:bg-slate-50"
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${meta.bg} ${meta.color}`}
      >
        <Icon size={16} />
      </div>

      <div className="min-w-0 flex-1">
        {/* ส่วนหลัก: หัวเรื่อง + หมวดหมู่ */}
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-medium text-slate-800">{n.title}</p>
          {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />}
        </div>

        {meta.label && (
          <span
            className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${meta.bg} ${meta.color}`}
          >
            {meta.label}
          </span>
        )}

        {/* ส่วนย่อย: รายละเอียด/บริบท พร้อมไฮไลต์คำสำคัญที่อยู่ในเครื่องหมายคำพูด */}
        {fullText && (
          <p
            ref={textRef}
            className={`mt-1 text-xs leading-relaxed text-slate-500 ${
              isExpanded ? "" : "line-clamp-2"
            }`}
          >
            {segments.map((seg, i) =>
              seg.type === "highlight" ? (
                <span
                  key={i}
                  className="mx-0.5 inline-flex items-center rounded-md bg-slate-100 px-1.5 py-[1px] text-[11px] font-semibold text-slate-700"
                >
                  {seg.value}
                </span>
              ) : (
                <span key={i}>{seg.value}</span>
              )
            )}
          </p>
        )}

        <div className="mt-1.5 flex items-center gap-2 text-[11px]">
          <span className="text-slate-400">{formatRelativeTime(n.createdAt)}</span>
          {isTruncatable && (
            <>
              <span className="text-slate-200">•</span>
              <span className="flex items-center gap-0.5 font-medium text-emerald-600">
                {isExpanded ? "ย่อ" : "อ่านเพิ่มเติม"}
                <ChevronDown
                  size={12}
                  className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
                />
              </span>
            </>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => onDelete(e, n.id)}
        aria-label="ลบการแจ้งเตือน"
        className="shrink-0 text-slate-300 opacity-0 hover:text-rose-500 group-hover:opacity-100"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  // เก็บ id ของแจ้งเตือนที่กำลังกดขยายดูข้อความเต็มอยู่ (ทีละอันพอ กดอันใหม่จะยุบอันเก่า)
  const [expandedId, setExpandedId] = useState(null);

  const refresh = () => setItems(getNotifications());

  useEffect(() => {
    refresh();
    // getNotifications() คืนค่า cache ทันที แล้วยิง fetch จริงเบื้องหลัง
    // subscribe ไว้เพื่อให้ UI อัปเดตอัตโนมัติเมื่อผลจาก backend กลับมา
    const unsubscribe = subscribeNotifications((list) => setItems(list));
    return unsubscribe;
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (!e.target.closest("[data-notification-bell]")) setOpen(false);
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const unreadCount = items.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    markAllAsRead();
    refresh();
  };

  // กดที่การ์ดแจ้งเตือน: อ่านแล้ว (ถ้ายังไม่อ่าน) + toggle เปิด/ปิดข้อความเต็ม
  const handleItemClick = (id) => {
    markAsRead(id);
    refresh();
    setExpandedId((current) => (current === id ? null : id));
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    deleteNotification(id);
    refresh();
    // กันเคสลบอันที่กำลังขยายอยู่ แล้ว state ค้าง
    setExpandedId((current) => (current === id ? null : current));
  };

  return (
    <div className="relative" data-notification-bell>
      <button
        type="button"
        aria-label="แจ้งเตือน"
        onClick={() => {
          setOpen((v) => !v);
          refresh();
        }}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:bg-slate-50"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl">
          <div className="flex items-center justify-between px-4 py-3">
            <p className="font-semibold text-slate-800">การแจ้งเตือน</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-emerald-600 hover:underline"
              >
                อ่านทั้งหมด
              </button>
            )}
          </div>

          <div className="max-h-80 divide-y divide-slate-50 overflow-y-auto">
            {items.map((n) => (
              <NotificationItem
                key={n.id}
                n={n}
                isExpanded={expandedId === n.id}
                onItemClick={handleItemClick}
                onDelete={handleDelete}
              />
            ))}

            {items.length === 0 && (
              <div className="px-4 py-10 text-center text-sm text-slate-400">
                ไม่มีการแจ้งเตือน
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
