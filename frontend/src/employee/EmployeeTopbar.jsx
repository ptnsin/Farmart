import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { getCachedUser, fetchCurrentUser } from "../data/authStore";
import EmployeeNotificationBell from "./EmployeeNotificationBell";

/**
 * แถบด้านบนของทุกหน้า employee (search + notification + avatar)
 * ดึง user เองภายในตัว ไม่ต้องส่ง user มาจากหน้าแม่
 *
 * @param {string} search - ค่า search ปัจจุบัน (ไม่ส่ง = ไม่ควบคุม input จากภายนอก)
 * @param {(value:string)=>void} onSearchChange - ถ้าไม่ส่งมา ช่อง search จะเป็น placeholder เฉยๆ (เช่นหน้า Add/Edit)
 * @param {string} roleLabel - ข้อความใต้ชื่อ user เช่น "Warehouse Staff"
 */
export default function EmployeeTopBar({
  search,
  onSearchChange,
  roleLabel = "Warehouse Staff",
  searchPlaceholder = "ค้นหาสินค้าด้วยชื่อหรือรหัสสินค้า...",
}) {
  const [user, setUser] = useState(getCachedUser());

  useEffect(() => {
    fetchCurrentUser().then(setUser).catch(() => {});
  }, []);

  const isControlled = typeof onSearchChange === "function";

  return (
    <div className="mb-8 flex items-center gap-4">
      <div className="relative flex-1">
        <Search
          size={18}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          value={isControlled ? search ?? "" : undefined}
          onChange={isControlled ? (e) => onSearchChange(e.target.value) : undefined}
          type="text"
          placeholder={searchPlaceholder}
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
        />
      </div>
      <EmployeeNotificationBell />
      <div className="flex items-center gap-3 rounded-full border border-slate-200 py-1.5 pl-1.5 pr-4">
        <img
          src={user?.avatar || "https://i.pravatar.cc/64?img=5"}
          alt=""
          className="h-8 w-8 rounded-full object-cover"
        />
        <div className="leading-tight">
          <p className="text-sm font-medium text-slate-800">{user?.name || "พนักงาน"}</p>
          <p className="text-xs text-slate-400">{roleLabel}</p>
        </div>
      </div>
    </div>
  );
}