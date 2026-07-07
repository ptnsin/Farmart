// userStore.js
// เก็บและจัดการข้อมูลผู้ใช้งานทั้งหมดผ่าน localStorage
// ทำหน้าที่เป็น "ฐานข้อมูลจำลอง" ฝั่ง client ให้ AdminUsers และ AdminUserNew ใช้ร่วมกัน

const STORAGE_KEY = "farmart_admin_users";

const THAI_MONTHS = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

// ข้อมูลเริ่มต้น (default/seed) — ใช้ตอนยังไม่เคยมีข้อมูลใน localStorage มาก่อน
const DEFAULT_USERS = [
  {
    id: 1,
    name: "กัญญา วนาวรรณ",
    email: "kanya.v@email.com",
    phone: "081-234-5671",
    role: "EMPLOYEE",
    status: "active",
    joined: "12 ก.ค. 2023",
    createdAt: "2023-07-12T00:00:00.000Z",
    avatar: "https://i.pravatar.cc/64?img=47",
  },
  {
    id: 2,
    name: "ธนาชัย นรินทร์",
    email: "thanachai.n@email.com",
    phone: "089-234-5672",
    role: "CUSTOMER",
    status: "suspended",
    joined: "05 มิ.ย. 2023",
    createdAt: "2023-06-05T00:00:00.000Z",
    avatar: "https://i.pravatar.cc/64?img=52",
  },
  {
    id: 3,
    name: "วิไลลักษณ์ แสงดาว",
    email: "wilailuck.s@email.com",
    phone: "082-234-5673",
    role: "ADMIN",
    status: "active",
    joined: "20 ม.ค. 2023",
    createdAt: "2023-01-20T00:00:00.000Z",
    avatar: "https://i.pravatar.cc/64?img=33",
  },
  {
    id: 4,
    name: "สมบัติ พืชผล",
    email: "sombat.p@email.com",
    phone: "086-234-5674",
    role: "EMPLOYEE",
    status: "active",
    joined: "15 ส.ค. 2023",
    createdAt: "2023-08-15T00:00:00.000Z",
    avatar: "https://i.pravatar.cc/64?img=14",
  },
];

/** แปลง Date เป็นข้อความวันที่แบบไทย เช่น "07 ก.ค. 2026" */
export function formatThaiDate(date = new Date()) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = THAI_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

function readRaw() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeRaw(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

/** ดึงรายชื่อผู้ใช้ทั้งหมด ถ้ายังไม่มีข้อมูลใน localStorage จะ seed ค่าเริ่มต้นให้อัตโนมัติ */
export function getUsers() {
  const existing = readRaw();
  if (existing && Array.isArray(existing)) return existing;
  writeRaw(DEFAULT_USERS);
  return DEFAULT_USERS;
}

/** บันทึกรายชื่อผู้ใช้ทั้งหมดทับของเดิม */
export function saveUsers(users) {
  writeRaw(users);
  return users;
}

/** ล้างข้อมูลทั้งหมดแล้วรีเซ็ตกลับเป็นค่าเริ่มต้น (ไว้ใช้ตอนสาธิต/ทดสอบ) */
export function resetUsers() {
  writeRaw(DEFAULT_USERS);
  return DEFAULT_USERS;
}

function nextId(users) {
  return users.reduce((max, u) => Math.max(max, u.id), 0) + 1;
}

/**
 * เพิ่มผู้ใช้ใหม่ลงในระบบและบันทึกลง localStorage ทันที
 * @param {{name:string,email:string,phone?:string,role:string,status:string}} data
 * @returns {object} ผู้ใช้ที่ถูกสร้างขึ้น (มี id, joined, avatar ให้อัตโนมัติ)
 */
export function addUser(data) {
  const users = getUsers();
  const id = nextId(users);
  const now = new Date();
  const newUser = {
    id,
    name: data.name.trim(),
    email: data.email.trim(),
    phone: data.phone?.trim() || "",
    role: data.role,
    status: data.status,
    joined: formatThaiDate(now),
    createdAt: now.toISOString(),
    avatar: `https://i.pravatar.cc/64?img=${(id % 70) + 1}`,
  };
  const updated = [newUser, ...users];
  writeRaw(updated);
  return newUser;
}

/** แก้ไขสถานะผู้ใช้ (active / suspended) */
export function updateUserStatus(id, status) {
  const users = getUsers().map((u) => (u.id === id ? { ...u, status } : u));
  writeRaw(users);
  return users;
}

/** ลบผู้ใช้ออกจากระบบ */
export function deleteUser(id) {
  const users = getUsers().filter((u) => u.id !== id);
  writeRaw(users);
  return users;
}