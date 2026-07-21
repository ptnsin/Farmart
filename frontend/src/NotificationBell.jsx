import { useEffect, useRef, useState } from "react";
import { Bell, Tag, PackageCheck, Mail, Trash2 } from "lucide-react";
import {
  fetchNotifications,
  getCachedNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  subscribeNotifications,
  unreadCount,
} from "./data/notificationStore";
import { getCachedUser } from "./data/authStore";

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

// ต้อง sync กับ DEFAULT_NOTIF ใน Profile.jsx และ "type" ที่ backend ใส่ให้ตอนสร้าง
// notification จริง (ดู notificationController.js) — ใช้ทั้งเลือกไอคอน/สี และกรองตาม
// notifyPreferences ของผู้ใช้ ถ้า backend ใช้คีย์คนละชื่อ ให้แก้ให้ตรงตรงนี้ที่เดียว
const NOTIF_TYPE_META = {
  orderUpdates: { icon: PackageCheck, wrap: "bg-blue-50 text-blue-600" },
  promotions: { icon: Tag, wrap: "bg-orange-50 text-orange-600" },
  newsletter: { icon: Mail, wrap: "bg-purple-50 text-purple-600" },
};
const DEFAULT_TYPE_META = { icon: Bell, wrap: "bg-gray-50 text-gray-500" };

function getTypeMeta(type) {
  return NOTIF_TYPE_META[type] || DEFAULT_TYPE_META;
}

// เคารพการตั้งค่าแจ้งเตือนจากหน้า Settings ฝั่ง client ด้วย (นอกเหนือจากที่ backend
// กรองตอนสร้าง record) เพื่อกันเคส record เก่าที่ถูกสร้างไว้ก่อนผู้ใช้จะปิดประเภทนั้น
function isNotifVisible(n, prefs) {
  if (!prefs) return true;
  if (!(n.type in prefs)) return true; // ประเภทที่ไม่รู้จัก ให้แสดงไว้ก่อน (fail-open)
  return prefs[n.type] !== false;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState(
    () => getCachedNotifications() ?? []
  );
  const [notifPrefs, setNotifPrefs] = useState(
    () => getCachedUser()?.notifyPreferences ?? null
  );
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    fetchNotifications()
      .then(setNotifications)
      .catch(() => {});
    const unsubscribe = subscribeNotifications((list) => {
      setNotifications([...list].sort((a, b) => b.createdAt - a.createdAt));
    });
    return unsubscribe;
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

  // รีเฟรชค่า preference เมื่อกลับมาโฟกัสแท็บ เผื่อเพิ่งไปกดบันทึกที่หน้า Settings
  useEffect(() => {
    function refreshPrefs() {
      setNotifPrefs(getCachedUser()?.notifyPreferences ?? null);
    }
    window.addEventListener("focus", refreshPrefs);
    return () => window.removeEventListener("focus", refreshPrefs);
  }, []);

  const visibleNotifications = notifications.filter((n) =>
    isNotifVisible(n, notifPrefs)
  );
  const unread = unreadCount(visibleNotifications);

  const handleToggle = () => {
    // ดึงค่า preference ล่าสุดทุกครั้งที่เปิดกระดิ่ง เผื่อเพิ่งกดบันทึกในแท็บ Settings มา
    setNotifPrefs(getCachedUser()?.notifyPreferences ?? null);
    setOpen((o) => !o);
  };

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    try {
      const updated = await markAllAsRead();
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
  };

  const handleDelete = async (n, e) => {
    e.stopPropagation();
    if (!window.confirm("ต้องการลบการแจ้งเตือนนี้ใช่หรือไม่?")) return;
    try {
      const updated = await deleteNotification(n.id);
      setNotifications(updated);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={handleToggle}
        title="การแจ้งเตือน"
        className="relative w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg z-30 overflow-hidden"
          style={{ width: 320, maxWidth: "90vw" }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-bold text-gray-900">การแจ้งเตือน</p>
            {unread > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-semibold text-green-700 hover:underline"
              >
                อ่านทั้งหมด
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {visibleNotifications.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">
                {notifications.length === 0
                  ? "ยังไม่มีการแจ้งเตือน"
                  : "ไม่มีการแจ้งเตือนตามที่คุณตั้งค่าไว้"}
              </p>
            ) : (
              visibleNotifications.map((n) => {
                const { icon: Icon, wrap } = getTypeMeta(n.type);
                return (
                  <button
                    key={n.id}
                    onClick={() => handleItemClick(n)}
                    style={{ width: "100%" }}
                    className={`text-left flex gap-3 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors ${
                      !n.read ? "bg-green-50/50" : ""
                    }`}
                  >
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${wrap}`}
                    >
                      <Icon className="w-4 h-4" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          style={{ wordBreak: "normal", overflowWrap: "break-word" }}
                          className={`text-xs leading-relaxed ${
                            !n.read
                              ? "font-bold text-gray-900"
                              : "font-medium text-gray-600"
                          }`}
                        >
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-green-600 mt-1 shrink-0" />
                        )}
                      </div>
                      <p
                        className="text-[11px] text-gray-400 mt-0.5"
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
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[10px] text-gray-300">
                          {timeAgo(n.createdAt)}
                        </span>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => handleDelete(n, e)}
                          title="ลบการแจ้งเตือนนี้"
                          className="text-gray-300 hover:text-red-500 p-1 -m-1 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </span>
                      </div>
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