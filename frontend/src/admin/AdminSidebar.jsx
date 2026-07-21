import { Link, useLocation } from "react-router-dom";
import {
  Users,
  ClipboardCheck,
  Warehouse,
  BadgePercent,
  BarChart3,
  Settings,
  LifeBuoy,
  Leaf,
} from "lucide-react";

const NAV_ITEMS = [
  { key: "users", label: "ผู้ใช้งาน", icon: Users, href: "/admin/users" },
  {
    key: "product-approvals",
    label: "อนุมัติสินค้า",
    icon: ClipboardCheck,
    href: "/admin/product-approvals",
  },
  { key: "inventory", label: "คลังสินค้า", icon: Warehouse, href: "/admin/inventory" },
  { key: "reports", label: "รายงาน/สถิติ", icon: BarChart3, href: "/admin/reports" },
];

// Active item is detected automatically from the current URL (via useLocation),
// so callers no longer need to pass an "active" prop.
export default function AdminSidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="hidden h-screen w-60 flex-shrink-0 flex-col border-r border-slate-100 bg-white px-4 py-6 md:flex">
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-700 text-white">
          <Leaf size={18} />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">Farmart</p>
          <p className="text-xs text-slate-400">Admin Console</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ key, label, icon: Icon, href }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={key}
              to={href}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                isActive
                  ? "bg-emerald-600 font-medium text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-slate-100 pt-4">
        <Link
          to="/admin/settings"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-500 hover:bg-slate-50"
        >
          <Settings size={18} />
          Settings
        </Link>
      </div>
    </aside>
  );
}