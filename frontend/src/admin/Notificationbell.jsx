import { useEffect, useState } from "react";
import {
  Bell,
  Package,
  AlertTriangle,
  UserPlus,
  BarChart3,
  ShoppingBag,
  Trash2,
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
  pendingApproval: { icon: Package, bg: "bg-amber-50", color: "text-amber-600" },
  lowStock: { icon: AlertTriangle, bg: "bg-rose-50", color: "text-rose-600" },
  newUser: { icon: UserPlus, bg: "bg-blue-50", color: "text-blue-600" },
  weeklyReport: { icon: BarChart3, bg: "bg-emerald-50", color: "text-emerald-600" },
  newOrder: { icon: ShoppingBag, bg: "bg-indigo-50", color: "text-indigo-600" },
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);

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

  const handleItemClick = (id) => {
    markAsRead(id);
    refresh();
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    deleteNotification(id);
    refresh();
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
            {items.map((n) => {
              const meta = TYPE_META[n.type] || TYPE_META.newOrder;
              const Icon = meta.icon;
              return (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n.id)}
                  className="group flex cursor-pointer items-start gap-3 px-4 py-3 hover:bg-slate-50"
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${meta.bg} ${meta.color}`}
                  >
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-medium text-slate-800">{n.title}</p>
                      {!n.read && (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                      )}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{n.description}</p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {formatRelativeTime(n.createdAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, n.id)}
                    aria-label="ลบการแจ้งเตือน"
                    className="shrink-0 text-slate-300 opacity-0 hover:text-rose-500 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}

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