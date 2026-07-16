import { useEffect, useRef, useState } from "react";
import {
  Search,
  Bell,
  HelpCircle,
  Pencil,
  Phone,
  Mail,
  MapPin,
  IdCard,
  Briefcase,
  Building2,
  CheckCircle2,
  ShieldCheck,
  User,
  Boxes,
  Clock3,
  Camera,
  Save,
  X,
} from "lucide-react";
import EmployeeSidebar from "./Employeesidebar";
import { getCachedUser, fetchCurrentUser } from "../data/authStore";

// ---------------------------------------------------------------------------
// Mock data — swap for real data via props/API as needed
// ---------------------------------------------------------------------------
const initialEmployee = {
  name: "นายมานะ อดทน",
  role: "พนักงานอาวุโส ฝ่ายคลังสินค้า",
  status: "พนักงานประจำอยู่ในไซต์",
  avatar:
    "https://ui-avatars.com/api/?name=Mana+Odton&background=DFF3E1&color=15803D&bold=true&size=128",
  personal: {
    fullName: "นายมานะ อดทน",
    email: "mana.a@agriharvest.com",
    phone: "081-234-5678",
    address: "123/45 หมู่บ้านชาวสวน ถ.พหลโยธิน แขวงจอมพล เขตจตุจักร กรุงเทพฯ 10900",
  },
  job: {
    employeeId: "AH-2023-084",
    startDate: "15 มีนาคม 2566",
    department: "ฝ่ายคลังสินค้า (Logistics & Warehouse)",
    workStatus: "กำลังปฏิบัติงาน",
  },
  reports: [
    { date: "24 พ.ค. 2567", activity: "ตรวจนับสต็อกข้าวหอมมะลิ 105 (โซน B)", progress: 100, status: "เรียบร้อย" },
    { date: "23 พ.ค. 2567", activity: "เตรียมสินค้าสำหรับคำสั่งซื้อ #ORD-7742", progress: 100, status: "เรียบร้อย" },
    { date: "23 พ.ค. 2567", activity: "รับของเข้าคลังพันธุ์ข้าวโพดใหม่", progress: 45, status: "กำลังดำเนินการ" },
  ],
};

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------
function InfoRow({ icon: Icon, label, value, editing, onChange, type = "text", locked = false }) {
  const showInput = editing && !locked;
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
        <Icon size={15} strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-400">
          {label}
          {editing && locked && <span className="ml-1 text-gray-300">(แก้ไขไม่ได้)</span>}
        </p>
        {showInput ? (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="mt-0.5 w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm font-medium text-gray-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />
        ) : (
          <p
            className={`break-words text-sm font-medium ${
              editing && locked ? "text-gray-400" : "text-gray-800"
            }`}
          >
            {value}
          </p>
        )}
      </div>
    </div>
  );
}

function CardShell({ icon: Icon, title, action, children }) {
  return (
    <div className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={17} className="text-green-600" />
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function StatusPill({ status }) {
  const done = status === "เรียบร้อย";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
        done ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
      }`}
    >
      {done ? <CheckCircle2 size={12} /> : <Clock3 size={12} />}
      {status}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function EmployeeProfile() {
  const [query, setQuery] = useState("");
  const [user, setUser] = useState(getCachedUser());
  const [employee, setEmployee] = useState(initialEmployee);
  const [draft, setDraft] = useState(initialEmployee);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchCurrentUser().then(setUser).catch(() => {});
  }, []);

  const startEditing = () => {
    setDraft(employee);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setDraft(employee);
    setIsEditing(false);
  };

  const saveEditing = () => {
    setEmployee(draft);
    setIsEditing(false);
  };

  const updatePersonal = (field, value) => {
    setDraft((prev) => ({ ...prev, personal: { ...prev.personal, [field]: value } }));
  };

  const updateJob = (field, value) => {
    setDraft((prev) => ({ ...prev, job: { ...prev.job, [field]: value } }));
  };

  const handleAvatarClick = () => {
    if (isEditing) fileInputRef.current?.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setDraft((prev) => ({ ...prev, avatar: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const shown = isEditing ? draft : employee;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <EmployeeSidebar />

      {/* Main column */}
      <main className="flex-1 overflow-y-auto px-6 py-6 md:px-10">
        {/* Top bar */}
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            
            
          </div>
          <div className="ml-auto flex items-center gap-5">
            <button
              type="button"
              aria-label="แจ้งเตือน"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:bg-slate-50"
            >
              <Bell size={18} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            </button>
            <button
              type="button"
              aria-label="ช่วยเหลือ"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:bg-slate-50"
            >
              <HelpCircle size={18} />
            </button>
            <div className="flex items-center gap-3 rounded-full border border-slate-200 py-1.5 pl-1.5 pr-4">
              <img
                src={user?.avatar || "https://i.pravatar.cc/64?img=5"}
                alt=""
                className="h-8 w-8 rounded-full object-cover"
              />
              <div className="leading-tight">
                <p className="text-sm font-medium text-slate-800">{user?.name || "Admin Manager"}</p>
                <p className="text-xs text-slate-400">ผู้ดูแลระบบ</p>
              </div>
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="mb-5 flex items-center gap-1.5 text-xs text-gray-400">
          <span className="font-medium text-green-600">โปรไฟล์พนักงาน</span>
        </div>

        {/* Profile header */}
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={shown.avatar}
                alt={shown.name}
                onClick={handleAvatarClick}
                className={`h-16 w-16 rounded-xl object-cover ${isEditing ? "cursor-pointer opacity-90" : ""}`}
              />
              {isEditing && (
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-white shadow-sm hover:bg-green-500"
                  aria-label="เปลี่ยนรูปโปรไฟล์"
                >
                  <Camera size={12} />
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div className="min-w-0 flex-1">
              {isEditing ? (
                <input
                  value={draft.name}
                  onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
                  className="mb-1 w-full max-w-xs rounded-lg border border-gray-200 px-2.5 py-1 text-base font-semibold text-gray-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />
              ) : (
                <p className="text-lg font-semibold text-gray-800">{shown.name}</p>
              )}
              {isEditing ? (
                <div className="flex items-center gap-1.5 text-sm text-gray-400">
                  <Briefcase size={13} />
                  <input
                    value={draft.role}
                    onChange={(e) => setDraft((prev) => ({ ...prev, role: e.target.value }))}
                    className="w-full max-w-xs rounded-lg border border-gray-200 px-2.5 py-1 text-sm text-gray-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              ) : (
                <p className="flex items-center gap-1.5 text-sm text-gray-400">
                  <Briefcase size={13} />
                  {shown.role}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600">
              <CheckCircle2 size={12} />
              {shown.status}
            </span>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={saveEditing}
                    className="flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500"
                  >
                    <Save size={14} />
                    บันทึก
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    <X size={14} />
                    ยกเลิก
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={startEditing}
                    className="flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500"
                  >
                    <Pencil size={14} />
                    แก้ไขโปรไฟล์
                  </button>
                  
                </>
              )}
            </div>
          </div>
        </div>

        {/* Two-column info */}
        <div className="grid grid-cols-2 gap-5">
          <CardShell icon={User} title="ข้อมูลส่วนตัว">
            <div className="space-y-4">
              <InfoRow
                icon={User}
                label="ชื่อ-นามสกุล"
                value={shown.personal.fullName}
                editing={isEditing}
                onChange={(v) => updatePersonal("fullName", v)}
              />
              <InfoRow
                icon={Mail}
                label="อีเมล"
                value={shown.personal.email}
                editing={isEditing}
                onChange={(v) => updatePersonal("email", v)}
                type="email"
                locked
              />
              <InfoRow
                icon={Phone}
                label="เบอร์โทรศัพท์"
                value={shown.personal.phone}
                editing={isEditing}
                onChange={(v) => updatePersonal("phone", v)}
              />
              <InfoRow
                icon={MapPin}
                label="ที่อยู่"
                value={shown.personal.address}
                editing={isEditing}
                onChange={(v) => updatePersonal("address", v)}
              />
            </div>
          </CardShell>

          <CardShell icon={Briefcase} title="รายละเอียดการทำงาน">
            <div className="space-y-4">
              <InfoRow
                icon={IdCard}
                label="รหัสพนักงาน"
                value={shown.job.employeeId}
                editing={isEditing}
                onChange={(v) => updateJob("employeeId", v)}
                locked
              />
              <InfoRow
                icon={Building2}
                label="วันที่เริ่มงาน"
                value={shown.job.startDate}
                editing={isEditing}
                onChange={(v) => updateJob("startDate", v)}
                locked
              />
              <InfoRow
                icon={Boxes}
                label="แผนก"
                value={shown.job.department}
                editing={isEditing}
                onChange={(v) => updateJob("department", v)}
              />
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
                  <ShieldCheck size={15} strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-400">สถานะปัจจุบัน</p>
                  {isEditing ? (
                    <select
                      value={draft.job.workStatus}
                      onChange={(e) => updateJob("workStatus", e.target.value)}
                      className="mt-0.5 w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm font-medium text-gray-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                    >
                      <option value="กำลังปฏิบัติงาน">กำลังปฏิบัติงาน</option>
                      <option value="ลาพัก">ลาพัก</option>
                      <option value="พ้นสภาพ">พ้นสภาพ</option>
                    </select>
                  ) : (
                    <span className="mt-1 inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-600">
                      {shown.job.workStatus}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardShell>
        </div>

        {/* Recent reports table */}
        <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">รายงานล่าสุด</h3>
            <button className="text-xs font-medium text-green-600 hover:underline">ดูทั้งหมด</button>
          </div>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs text-gray-400">
                <th className="pb-2 font-normal">วันที่</th>
                <th className="pb-2 font-normal">กิจกรรม</th>
                <th className="pb-2 font-normal">ความคืบหน้า</th>
                <th className="pb-2 font-normal">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {employee.reports.map((r, i) => (
                <tr key={i} className="border-t border-gray-50">
                  <td className="py-3 text-xs text-gray-500">{r.date}</td>
                  <td className="py-3 pr-4 text-sm text-gray-700">{r.activity}</td>
                  <td className="py-3">
                    <div className="h-1.5 w-28 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-green-500"
                        style={{ width: `${r.progress}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-3">
                    <StatusPill status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}