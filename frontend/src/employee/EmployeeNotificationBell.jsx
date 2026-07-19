import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, PackageCheck, Truck, AlertTriangle, Check } from "lucide-react";
import {
  fetchEmployeeNotifications,
  markAsRead,
  markAllAsRead,
  subscribeEmployeeNotifications,
  unreadCount,
} from "../data/employeeNotificationStore";

// รีเฟรชแจ้งเตือนอัตโนมัติทุก 60 วิ เพราะไม่มี real-time push จาก backend
// (แจ้งเตือนคำนวณสดจาก /api/orders กับ /api/shipments ทุกครั้ง ไม่ใช่ค่า cache นิ่ง ๆ)
const POLL_INTERVAL_MS = 60_000;

function timeAgo(ts) {
  const diffMs = Date.now() - ts;
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "เมื่อสักครู่";
  if (min < 60) return `${min} นาทีที่แล้ว`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} ชั่วโมงที่แล้ว`;
  const day = Math.floor(hr / 24);
  return `${day} วันที่แล้ว`;
}

export default function EmployeeNotificationBell() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    function load() {
      fetchEmployeeNotifications()
        .then((list) => {
          if (!cancelled) setNotifications(list);
        })
        .catch(() => {
          /* เงียบไว้ — กระดิ่งไม่ควรทำหน้าอื่นพังถ้าโหลดแจ้งเตือนไม่สำเร็จ */
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }

    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    const unsubscribe = subscribeEmployeeNotifications((list) => {
      if (!cancelled) setNotifications(list);
    });

    return () => {
      cancelled = true;
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unread = unreadCount(notifications);

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    try {
      const updated = await markAllAsRead(notifications);
      setNotifications(updated);
    } catch {
      /* ignore */
    }
  };

  const handleItemClick = async (n) => {
    if (!n.read) {
      try {
        const updated = await markAsRead(n.id);
        setNotifications(updated);
      } catch {
        /* ignore */
      }
    }
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="แจ้งเตือน"
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:bg-slate-50"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-lg z-30 overflow-hidden"
          style={{ width: 340, maxWidth: "90vw" }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-bold text-slate-800">การแจ้งเตือน</p>
            {unread > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs font-semibold text-emerald-600 hover:underline"
              >
                อ่านทั้งหมด
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <p className="text-xs text-slate-400 text-center py-8">กำลังโหลด...</p>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8">
                <Check size={20} className="text-emerald-400" />
                <p className="text-xs text-slate-400">ไม่มีเรื่องด่วนตอนนี้</p>
              </div>
            ) : (
              notifications.map((n) => {
                const Icon = n.type === "order" ? PackageCheck : n.type === "stock" ? AlertTriangle : Truck;
                const iconStyle =
                  n.type === "order"
                    ? "bg-amber-50 text-amber-600"
                    : n.type === "stock"
                    ? "bg-orange-50 text-orange-600"
                    : "bg-rose-50 text-rose-500";
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => handleItemClick(n)}
                    style={{ width: "100%" }}
                    className={`text-left flex gap-3 px-4 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors ${
                      !n.read ? "bg-emerald-50/50" : ""
                    }`}
                  >
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${iconStyle}`}
                    >
                      <Icon className="w-4 h-4" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          style={{ wordBreak: "normal", overflowWrap: "break-word" }}
                          className={`text-xs leading-relaxed ${
                            !n.read ? "font-bold text-slate-800" : "font-medium text-slate-600"
                          }`}
                        >
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-emerald-600 mt-1 shrink-0" />
                        )}
                      </div>
                      <p
                        className="text-[11px] text-slate-400 mt-0.5"
                        style={{
                          wordBreak: "normal",
                          overflowWrap: "break-word",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {n.message}
                      </p>
                      <span className="text-[10px] text-slate-300 mt-1.5 inline-block">
                        {timeAgo(n.createdAt)}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}