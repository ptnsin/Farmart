import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings,
  User,
  Bell,
  Lock,
  Globe,
  Save,
  Loader2,
} from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import { getCachedUser, fetchCurrentUser } from "../data/authStore";
import { updateUser } from "../data/userStore";

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
        checked ? "bg-emerald-600" : "bg-slate-200"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
          checked ? "left-5" : "left-0.5"
        }`}
      />
    </button>
  );
}

export default function AdminSettings() {
  const navigate = useNavigate();
  const cached = getCachedUser();
  const [currentUser, setCurrentUser] = useState(cached);
  const [profile, setProfile] = useState({
    name: cached?.name || "",
    email: cached?.email || "",
    phone: cached?.phone || "",
  });
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    fetchCurrentUser()
      .then((user) => {
        setCurrentUser(user);
        setProfile({ name: user.name || "", email: user.email || "", phone: user.phone || "" });
      })
      .catch((err) => {
        if (err.message.includes("เข้าสู่ระบบ")) navigate("/");
      });
  }, [navigate]);

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    setSaving(true);
    setSaveMessage("");
    try {
      const updated = await updateUser(currentUser.id, profile);
      setCurrentUser(updated);
      setSaveMessage("บันทึกข้อมูลเรียบร้อยแล้ว");
    } catch (err) {
      setSaveMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const [notifications, setNotifications] = useState({
    newOrder: true,
    lowStock: true,
    weeklyReport: false,
  });

  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  const [locale, setLocale] = useState({ language: "th", timezone: "Asia/Bangkok" });

  const updateProfile = (field) => (e) =>
    setProfile((p) => ({ ...p, [field]: e.target.value }));

  const updatePassword = (field) => (e) =>
    setPasswords((p) => ({ ...p, [field]: e.target.value }));

  const toggleNotification = (field) => () =>
    setNotifications((n) => ({ ...n, [field]: !n[field] }));

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto px-6 py-6 md:px-10">
        <div className="flex items-center gap-2 text-emerald-700">
          <Settings size={20} />
          <h1 className="text-2xl font-semibold text-slate-800">ตั้งค่า</h1>
        </div>
        <p className="mt-1 text-sm text-slate-400">
          จัดการข้อมูลบัญชี การแจ้งเตือน ความปลอดภัย และการตั้งค่าระบบของ Admin Console
        </p>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Profile */}
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-800">
              <User size={18} className="text-emerald-600" />
              ข้อมูลบัญชี
            </h2>

            <div className="mt-4 flex items-center gap-4">
              <img
                src={currentUser?.avatar || "https://i.pravatar.cc/80?img=12"}
                alt=""
                className="h-16 w-16 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-medium text-slate-800">{profile.name || "Admin"}</p>
                <p className="text-xs text-slate-400">
                  {currentUser?.joined ? `สมาชิกตั้งแต่ ${currentUser.joined}` : ""}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-slate-600">ชื่อ-นามสกุล</label>
                <input
                  value={profile.name}
                  onChange={updateProfile("name")}
                  type="text"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">อีเมล</label>
                <input
                  value={profile.email}
                  onChange={updateProfile("email")}
                  type="email"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm text-slate-600">เบอร์โทรศัพท์</label>
                <input
                  value={profile.phone}
                  onChange={updateProfile("phone")}
                  type="tel"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>

            {saveMessage && (
              <p
                className={`mt-3 text-sm ${
                  saveMessage.includes("เรียบร้อย") ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {saveMessage}
              </p>
            )}

            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={saving}
              className="mt-5 flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
            </button>
          </div>

          {/* Notifications */}
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-800">
              <Bell size={18} className="text-emerald-600" />
              การแจ้งเตือน
            </h2>

            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-700">คำสั่งซื้อใหม่</p>
                  <p className="text-xs text-slate-400">แจ้งเตือนทุกครั้งที่มีคำสั่งซื้อเข้ามา</p>
                </div>
                <Toggle checked={notifications.newOrder} onChange={toggleNotification("newOrder")} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-700">สินค้าใกล้หมด</p>
                  <p className="text-xs text-slate-400">แจ้งเตือนเมื่อสต็อกสินค้าต่ำกว่าเกณฑ์</p>
                </div>
                <Toggle checked={notifications.lowStock} onChange={toggleNotification("lowStock")} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-700">สรุปรายงานประจำสัปดาห์</p>
                  <p className="text-xs text-slate-400">ส่งสรุปยอดขายและสถิติทุกวันจันทร์</p>
                </div>
                <Toggle
                  checked={notifications.weeklyReport}
                  onChange={toggleNotification("weeklyReport")}
                />
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-800">
              <Lock size={18} className="text-emerald-600" />
              ความปลอดภัย
            </h2>
            <p className="mt-1 text-sm text-slate-400">เปลี่ยนรหัสผ่านสำหรับเข้าสู่ระบบ Admin Console</p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm text-slate-600">รหัสผ่านเดิม</label>
                <input
                  value={passwords.current}
                  onChange={updatePassword("current")}
                  type="password"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-slate-600">รหัสผ่านใหม่</label>
                  <input
                    value={passwords.next}
                    onChange={updatePassword("next")}
                    type="password"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-600">ยืนยันรหัสผ่านใหม่</label>
                  <input
                    value={passwords.confirm}
                    onChange={updatePassword("confirm")}
                    type="password"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              className="mt-5 flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
            >
              <Save size={16} />
              อัปเดตรหัสผ่าน
            </button>
          </div>

          {/* System */}
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-800">
              <Globe size={18} className="text-emerald-600" />
              การตั้งค่าระบบ
            </h2>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-slate-600">ภาษา</label>
                <select
                  value={locale.language}
                  onChange={(e) => setLocale((l) => ({ ...l, language: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="th">ไทย</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">เขตเวลา</label>
                <select
                  value={locale.timezone}
                  onChange={(e) => setLocale((l) => ({ ...l, timezone: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="Asia/Bangkok">Asia/Bangkok (GMT+7)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              className="mt-5 flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
            >
              <Save size={16} />
              บันทึกการตั้งค่า
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}