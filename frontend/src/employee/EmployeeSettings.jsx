import { useEffect, useState } from "react";
import { Search, Bell } from "lucide-react";
import EmployeeSidebar from "./EmployeeSidebar";
import { getCachedUser, fetchCurrentUser } from "../data/authStore";

export default function EmployeeSettings() {
  const [user, setUser] = useState(getCachedUser());
  const [profile, setProfile] = useState({
    name: "พนักงานคลังสินค้า",
    email: "employee@farmart.co.th",
    phone: "08x-xxx-xxxx",
  });
  const [notify, setNotify] = useState({
    newOrder: true,
    lowStock: true,
    shippingUpdate: false,
  });
  const [savedMsg, setSavedMsg] = useState("");

  useEffect(() => {
    fetchCurrentUser().then(setUser).catch(() => {});
  }, []);

  // พอโหลดข้อมูลผู้ใช้ที่ล็อกอินอยู่มาได้แล้ว ให้เติมลงฟอร์มแทนค่า placeholder เริ่มต้น
  useEffect(() => {
    if (!user) return;
    setProfile((p) => ({
      ...p,
      name: user.name || p.name,
      email: user.email || p.email,
      phone: user.phone || p.phone,
    }));
  }, [user]);

  const updateProfile = (key) => (e) => setProfile((p) => ({ ...p, [key]: e.target.value }));
  const toggleNotify = (key) => setNotify((n) => ({ ...n, [key]: !n[key] }));

  const handleSave = (e) => {
    e.preventDefault();
    // TODO: เชื่อมต่อ API บันทึกการตั้งค่าจริง
    setSavedMsg("บันทึกการตั้งค่าเรียบร้อยแล้ว");
    setTimeout(() => setSavedMsg(""), 2500);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <EmployeeSidebar />

      <main className="flex-1 overflow-y-auto px-6 py-6 md:px-10">
        {/* Top bar */}
        <div className="mb-8 flex items-center gap-4">
          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="ค้นหา..."
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
            <img src={user?.avatar || "https://i.pravatar.cc/64?img=5"} alt="" className="h-8 w-8 rounded-full object-cover" />
            <div className="leading-tight">
              <p className="text-sm font-medium text-slate-800">{user?.name || "พนักงาน"}</p>
              <p className="text-xs text-slate-400">Warehouse Staff</p>
            </div>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-semibold text-emerald-800">ตั้งค่า</h1>
          <p className="mt-1 text-sm text-slate-400">จัดการข้อมูลบัญชีและการแจ้งเตือนของคุณ</p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <form
            onSubmit={handleSave}
            className="rounded-xl border border-slate-100 bg-white p-6 lg:col-span-2"
          >
            <h2 className="mb-4 text-base font-semibold text-slate-800">ข้อมูลส่วนตัว</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-600">ชื่อ-นามสกุล</label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  value={profile.name}
                  onChange={updateProfile("name")}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-600">อีเมล</label>
                <input
                  type="email"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  value={profile.email}
                  onChange={updateProfile("email")}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-600">เบอร์โทรศัพท์</label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  value={profile.phone}
                  onChange={updateProfile("phone")}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-600">รหัสผ่านใหม่</label>
                <input
                  type="password"
                  placeholder="เว้นว่างไว้หากไม่ต้องการเปลี่ยน"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-600">ยืนยันรหัสผ่านใหม่</label>
                <input
                  type="password"
                  placeholder="กรอกรหัสผ่านอีกครั้ง"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
              <span className="text-sm text-emerald-600">{savedMsg}</span>
              <button
                type="submit"
                className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800"
              >
                บันทึกการเปลี่ยนแปลง
              </button>
            </div>
          </form>

          <div className="rounded-xl border border-slate-100 bg-white p-6">
            <h2 className="mb-4 text-base font-semibold text-slate-800">การแจ้งเตือน</h2>
            {[
              { key: "newOrder", label: "แจ้งเตือนเมื่อมีคำสั่งซื้อใหม่" },
              { key: "lowStock", label: "แจ้งเตือนเมื่อสินค้าใกล้หมด" },
              { key: "shippingUpdate", label: "แจ้งเตือนเมื่อสถานะพัสดุเปลี่ยน" },
            ].map(({ key, label }) => (
              <label
                key={key}
                className="flex cursor-pointer items-center justify-between border-b border-slate-50 py-3 text-sm text-slate-600 last:border-0"
              >
                {label}
                <input
                  type="checkbox"
                  checked={notify[key]}
                  onChange={() => toggleNotify(key)}
                  className="h-4 w-4 accent-emerald-600"
                />
              </label>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}