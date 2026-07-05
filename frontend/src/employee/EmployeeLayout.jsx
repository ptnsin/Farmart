// EmployeeLayout.jsx
// Shared sidebar + topbar shell for every Employee page.
// Drop this in frontend/src/employee/ alongside the other Employee* files.
// Wrap the employee routes with it in App.jsx (see routes-example.jsx).

import { NavLink, Outlet } from "react-router-dom";
import {
  IconOrders,
  IconWarehouse,
  IconTruck,
  IconSettings,
  IconSupport,
  IconSearch,
  IconHelp,
  IconLeaf,
} from "./EmployeeIcons";
import "./employee.css";

const NAV_ITEMS = [
  { to: "/employee/orders", label: "หน้าคำสั่งซื้อ", icon: IconOrders },
  { to: "/employee/warehouse", label: "หน้าคลังสินค้า", icon: IconWarehouse },
  { to: "/employee/shipping", label: "หน้าการขนส่ง", icon: IconTruck },
];

const FOOTER_ITEMS = [
  { to: "/employee/settings", label: "ตั้งค่า", icon: IconSettings },
  { to: "/employee/support", label: "Support", icon: IconSupport },
];

export default function EmployeeLayout() {
  return (
    <div className="emp-app">
      <aside className="emp-sidebar">
        <div className="emp-brand">
          <div className="emp-brand-icon">
            <IconLeaf width={18} height={18} />
          </div>
          <div>
            <div className="emp-brand-name">Farmart</div>
            <div className="emp-brand-sub">Employee Console</div>
          </div>
        </div>

        <nav className="emp-nav">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `emp-nav-link${isActive ? " active" : ""}`}
            >
              <Icon />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="emp-nav-divider" />

        <div className="emp-nav-footer">
          {FOOTER_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `emp-nav-link${isActive ? " active" : ""}`}
            >
              <Icon />
              {label}
            </NavLink>
          ))}
        </div>
      </aside>

      <div className="emp-main">
        <header className="emp-topbar">
          <div className="emp-search">
            <IconSearch width={16} height={16} />
            <input placeholder="ค้นหาคำสั่งซื้อ, สินค้า หรือพัสดุ..." />
          </div>
          <div className="emp-topbar-spacer" />
          <button className="emp-icon-btn" aria-label="ช่วยเหลือ">
            <IconHelp width={17} height={17} />
          </button>
          <div className="emp-avatar-block">
            <div className="emp-avatar">พน</div>
            <div>
              <div className="emp-avatar-name">พนักงาน</div>
              <div className="emp-avatar-role">Employee</div>
            </div>
          </div>
        </header>

        <main className="emp-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}