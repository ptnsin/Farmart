import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
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
import { getUsers, updateUserStatus, deleteUser } from "../data/userStore";
import { getCachedUser, fetchCurrentUser } from "../data/authStore";

const ROLE_STYLES = {
  EMPLOYEE: "text-slate-600",
  CUSTOMER: "text-slate-600",
  ADMIN: "text-emerald-700 font-semibold",
};

const STATUS_STYLES = {
  active: { dot: "bg-emerald-500", text: "text-emerald-600", label: "ใช้งานอยู่" },
  suspended: { dot: "bg-rose-500", text: "text-rose-500", label: "ถูกระงับ" },
};

const PAGE_SIZE = 8;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function Avatar({ src, name }) {
  return <img src={src} alt={name} className="h-9 w-9 rounded-full object-cover" />;
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

/** สร้างรายการเลขหน้าแบบมี ... คั่นเมื่อจำนวนหน้าเยอะ */
function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  return Array.from(pages)
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
}

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(getCachedUser());
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getUsers()
      .then((data) => {
        if (!cancelled) setUsers(data);
      })
      .catch((err) => {
        if (cancelled) return;
        // token หมดอายุ/ยังไม่ได้ login -> เด้งกลับไปหน้า login
        if (err.message.includes("เข้าสู่ระบบ")) {
          navigate("/");
          return;
        }
        setLoadError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  useEffect(() => {
    fetchCurrentUser()
      .then(setCurrentUser)
      .catch((err) => {
        if (err.message.includes("เข้าสู่ระบบ")) navigate("/");
      });
  }, [navigate]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (!e.target.closest("[data-user-menu]")) setOpenMenuId(null);
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const filteredUsers = useMemo(() => {
    if (!query.trim()) return users;
    const q = query.trim().toLowerCase();
    return users.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [users, query]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + PAGE_SIZE);

  const stats = useMemo(() => {
    const total = users.length;
    const activeCount = users.filter((u) => u.status === "active").length;
    const newCount = users.filter(
      (u) => u.createdAt && Date.now() - new Date(u.createdAt).getTime() < ONE_DAY_MS
    ).length;
    const activePct = total ? Math.round((activeCount / total) * 100) : 0;

    return [
      {
        id: "total",
        label: "TOTAL USERS",
        value: total.toLocaleString(),
        note: "ผู้ใช้งานทั้งหมดในระบบ",
        icon: Users,
        iconBg: "bg-slate-100",
        iconColor: "text-slate-500",
      },
      {
        id: "active",
        label: "ACTIVE USERS",
        value: activeCount.toLocaleString(),
        note: `${activePct}% ของผู้ใช้ทั้งหมด`,
        icon: Leaf,
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-600",
      },
      {
        id: "new",
        label: "NEW REGISTRATIONS",
        value: newCount.toLocaleString(),
        note: "24 ชั่วโมงที่ผ่านมา",
        icon: UserPlus,
        iconBg: "bg-slate-100",
        iconColor: "text-slate-500",
      },
    ];
  }, [users]);

  const handleSuspend = async (id) => {
    setOpenMenuId(null);
    try {
      const updated = await updateUserStatus(id, "suspended");
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUnlock = async (id) => {
    try {
      const updated = await updateUserStatus(id, "active");
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    setOpenMenuId(null);
    if (!window.confirm("ต้องการลบผู้ใช้งานคนนี้ออกจากระบบหรือไม่?")) return;
    try {
      const remaining = await deleteUser(id);
      setUsers(remaining);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto px-6 py-6 md:px-10">
        {loading && (
          <div className="mb-4 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
            กำลังโหลดข้อมูลผู้ใช้...
          </div>
        )}
        {loadError && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {loadError}
          </div>
        )}
        {/* Top bar */}
        <div className="mb-8 flex items-center gap-4">
          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={query}
              onChange={(e) => {
                setPage(1);
                setQuery(e.target.value);
              }}
              type="text"
              placeholder="ค้นหาผู้ใช้งานด้วยชื่อหรืออีเมล..."
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
              src={currentUser?.avatar || "https://i.pravatar.cc/64?img=12"}
              alt=""
              className="h-8 w-8 rounded-full object-cover"
            />
            <div className="leading-tight">
              <p className="text-sm font-medium text-slate-800">{currentUser?.name || "Admin"}</p>
              <p className="text-xs text-slate-400">{currentUser?.role || "Admin"}</p>
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
          <div className="flex items-center gap-3">
            <Link
              to="/admin/users/new"
              className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800"
            >
              <UserPlus size={16} />
              เพิ่มบัญชีผู้ใช้
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <StatCard key={stat.id} {...stat} />
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
            {filteredUsers.length === 0
              ? "ไม่พบรายการ"
              : `แสดงผล ${startIndex + 1} - ${Math.min(
                  startIndex + PAGE_SIZE,
                  filteredUsers.length
                )} จาก ${filteredUsers.length} รายการ`}
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
              {paginatedUsers.map((user) => {
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
                            onClick={() => handleUnlock(user.id)}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          >
                            <Lock size={14} />
                          </button>
                        ) : (
                          <div className="relative" data-user-menu>
                            <button
                              type="button"
                              aria-label="เพิ่มเติม"
                              onClick={() =>
                                setOpenMenuId(openMenuId === user.id ? null : user.id)
                              }
                              className="hover:text-slate-600"
                            >
                              <MoreVertical size={16} />
                            </button>
                            {openMenuId === user.id && (
                              <div className="absolute right-0 z-10 mt-1 w-40 overflow-hidden rounded-lg border border-slate-100 bg-white shadow-lg">
                                <button
                                  type="button"
                                  onClick={() => handleSuspend(user.id)}
                                  className="block w-full px-4 py-2 text-left text-xs text-slate-600 hover:bg-slate-50"
                                >
                                  ระงับการใช้งาน
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(user.id)}
                                  className="block w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50"
                                >
                                  ลบผู้ใช้งาน
                                </button>
                              </div>
                            )}
                          </div>
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
          {filteredUsers.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3 text-sm">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex items-center gap-1 text-slate-400 hover:text-slate-600 disabled:opacity-40"
                disabled={safePage === 1}
              >
                <ChevronLeft size={16} />
                ย้อนกลับ
              </button>
              <div className="flex items-center gap-1">
                {getPageNumbers(safePage, totalPages).map((n, idx, arr) => (
                  <span key={n} className="flex items-center gap-1">
                    {idx > 0 && n - arr[idx - 1] > 1 && (
                      <span className="px-1 text-slate-400">...</span>
                    )}
                    <button
                      type="button"
                      onClick={() => setPage(n)}
                      className={`h-8 w-8 rounded-lg text-sm ${
                        safePage === n
                          ? "bg-emerald-700 font-medium text-white"
                          : "text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      {n}
                    </button>
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="flex items-center gap-1 text-slate-400 hover:text-slate-600 disabled:opacity-40"
                disabled={safePage === totalPages}
              >
                ถัดไป
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}