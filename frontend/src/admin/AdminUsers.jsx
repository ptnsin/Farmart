import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  HelpCircle,
  Eye,
  Pencil,
  MoreVertical,
  Lock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Users,
  UserPlus,
} from "lucide-react";
import AdminSidebar from "./AdminSidebar";


const ROLE_STYLES = {
  FARMER: "text-slate-600",
  CUSTOMER: "text-slate-600",
  ADMIN: "text-emerald-700 font-semibold",
};

const STATUS_STYLES = {
  active: { dot: "bg-emerald-500", text: "text-emerald-600", label: "ใช้งานอยู่" },
  suspended: { dot: "bg-rose-500", text: "text-rose-500", label: "ถูกระงับ" },
};

const USERS = [
  {
    id: 1,
    name: "กัญญา วนาวรรณ",
    email: "kanya.v@email.com",
    role: "FARMER",
    status: "active",
    joined: "12 ก.ค. 2023",
    avatar: "https://i.pravatar.cc/64?img=47",
  },
  {
    id: 2,
    name: "ธนาชัย นรินทร์",
    email: "thanachai.n@email.com",
    role: "CUSTOMER",
    status: "suspended",
    joined: "05 มิ.ย. 2023",
    avatar: "https://i.pravatar.cc/64?img=52",
  },
  {
    id: 3,
    name: "วิไลลักษณ์ แสงดาว",
    email: "wilailuck.s@email.com",
    role: "ADMIN",
    status: "active",
    joined: "20 ม.ค. 2023",
    avatar: "https://i.pravatar.cc/64?img=33",
  },
  {
    id: 4,
    name: "สมบัติ พืชผล",
    email: "sombat.p@email.com",
    role: "FARMER",
    status: "active",
    joined: "15 ส.ค. 2023",
    avatar: "https://i.pravatar.cc/64?img=14",
  },
];

const STATS = [
  {
    key: "total",
    label: "TOTAL USERS",
    value: "12,840",
    note: "+12% จากเดือนที่แล้ว",
    icon: Users,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-500",
  },
  {
    key: "active",
    label: "ACTIVE TODAY",
    value: "1,205",
    note: "8.4% ของผู้ใช้ทั้งหมด",
    icon: Leaf,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    key: "new",
    label: "NEW REGISTRATIONS",
    value: "48",
    note: "24 ชั่วโมงที่ผ่านมา",
    icon: UserPlus,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-500",
  },
];

const TOTAL_PAGES = 1284;
const TOTAL_RECORDS = 12840;

function Avatar({ src, name }) {
  return (
    <img
      src={src}
      alt={name}
      className="h-9 w-9 rounded-full object-cover"
    />
  );
}

function StatCard({ label, value, note, icon: Icon, iconBg, iconColor }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className={`flex h-11 w-11 items-center justify-center rounded-full ${iconBg} ${iconColor}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs font-medium tracking-wide text-slate-400">{label}</p>
        <p className="text-2xl font-semibold text-slate-800">{value}</p>
        <p className="text-xs text-emerald-600">{note}</p>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filteredUsers = useMemo(() => {
    if (!query.trim()) return USERS;
    const q = query.trim().toLowerCase();
    return USERS.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar />

      {/* Main content */}
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
                onChange={(e) => setPage(1) || setQuery(e.target.value)}
                type="text"
                placeholder="ค้นหาผู้ใช้งานด้วยชื่อหรืออีเมล..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <button
              type="button"
              aria-label="ช่วยเหลือ"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:bg-slate-50"
            >
              <HelpCircle size={18} />
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

          {/* Heading */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-emerald-800">การจัดการบัญชีผู้ใช้</h1>
              <p className="mt-1 text-sm text-slate-400">
                ตรวจสอบและจัดการสิทธิ์การเข้าถึงของผู้ใช้งานในระบบ Farmart
              </p>
            </div>
            <Link
              to="/admin/users/new"
              className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800"
            >
              <UserPlus size={16} />
              เพิ่มบัญชีผู้ใช้
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {STATS.map((stat) => (
              <StatCard key={stat.key} {...stat} />
            ))}
          </div>

          {/* Filter row */}
          <div className="mt-8 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>ตัวกรองรายการ:</span>
              <button
                type="button"
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700"
              >
                ทั้งหมด
                <ChevronDown size={14} />
              </button>
            </div>
            <p className="text-sm text-slate-400">
              แสดงผล 1 - {filteredUsers.length} จาก {TOTAL_RECORDS.toLocaleString()} รายการ
            </p>
          </div>

          {/* Table */}
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-100 bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-400">
                  <th className="px-6 py-3 font-medium">ผู้ใช้งาน</th>
                  <th className="px-6 py-3 font-medium">บทบาท</th>
                  <th className="px-6 py-3 font-medium">สถานะ</th>
                  <th className="px-6 py-3 font-medium">วันที่เข้าร่วม</th>
                  <th className="px-6 py-3 text-right font-medium">การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const status = STATUS_STYLES[user.status];
                  return (
                    <tr key={user.id} className="border-b border-slate-50 last:border-0">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar src={user.avatar} name={user.name} />
                          <div>
                            <p className="font-medium text-slate-800">{user.name}</p>
                            <p className="text-xs text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className={`px-6 py-3.5 text-xs ${ROLE_STYLES[user.role]}`}>
                        {user.role}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-xs ${status.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-slate-500">{user.joined}</td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center justify-end gap-3 text-slate-400">
                          <button type="button" aria-label="ดูข้อมูล" className="hover:text-slate-600">
                            <Eye size={16} />
                          </button>
                          <button type="button" aria-label="แก้ไข" className="hover:text-slate-600">
                            <Pencil size={16} />
                          </button>
                          {user.status === "suspended" ? (
                            <button
                              type="button"
                              aria-label="ปลดล็อกบัญชี"
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                            >
                              <Lock size={14} />
                            </button>
                          ) : (
                            <button type="button" aria-label="เพิ่มเติม" className="hover:text-slate-600">
                              <MoreVertical size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-400">
                      ไม่พบผู้ใช้งานที่ตรงกับคำค้นหา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3 text-sm">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex items-center gap-1 text-slate-400 hover:text-slate-600 disabled:opacity-40"
                disabled={page === 1}
              >
                <ChevronLeft size={16} />
                ย้อนกลับ
              </button>
              <div className="flex items-center gap-1">
                {[1, 2, 3].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPage(n)}
                    className={`h-8 w-8 rounded-lg text-sm ${
                      page === n
                        ? "bg-emerald-700 font-medium text-white"
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <span className="px-1 text-slate-400">...</span>
                <button
                  type="button"
                  onClick={() => setPage(TOTAL_PAGES)}
                  className="h-8 w-8 rounded-lg text-sm text-slate-500 hover:bg-slate-50"
                >
                  {TOTAL_PAGES}
                </button>
              </div>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(TOTAL_PAGES, p + 1))}
                className="flex items-center gap-1 text-slate-400 hover:text-slate-600"
              >
                ถัดไป
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Help banner */}
          <div className="mt-6 flex items-center justify-between overflow-hidden rounded-xl bg-emerald-800 px-8 py-6 text-white">
            <div className="max-w-md">
              <h3 className="text-lg font-semibold">ต้องการความช่วยเหลือ?</h3>
              <p className="mt-1 text-sm text-emerald-100">
                หากคุณมีปัญหาในการจัดการบัญชีผู้ใช้หรือต้องการตรวจสอบประวัติความปลอดภัยเชิงลึก
                กรุณาติดต่อทีมพัฒนาระบบเทคนิคได้ตลอด 24 ชั่วโมง
              </p>
              <button
                type="button"
                className="mt-4 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-emerald-950 hover:bg-emerald-400"
              >
                เปิดตั๋วความช่วยเหลือ
              </button>
            </div>
            <img
              src="https://images.unsplash.com/photo-1592982537447-6f2a6a0c7c8a?w=300&h=200&fit=crop"
              alt=""
              className="hidden h-28 w-40 rounded-lg object-cover md:block"
            />
          </div>
      </main>
    </div>
  );
}