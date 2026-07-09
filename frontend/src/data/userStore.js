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
// หมายเหตุ: password ของ seed users ทั้งหมดคือ "password123" (ไว้ทดสอบ login เท่านั้น)
const DEFAULT_USERS = [
  {
    id: 1,
    name: "กัญญา วนาวรรณ",
    email: "kanya.v@email.com",
    phone: "081-234-5671",
    password: "password123",
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
    password: "password123",
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
    password: "password123",
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
    password: "password123",
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
    avatar: data.avatar?.trim() || `https://i.pravatar.cc/64?img=${(id % 70) + 1}`,
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

/** ค้นหาผู้ใช้จากอีเมล (ไม่สนตัวพิมพ์เล็ก-ใหญ่) */
export function findUserByEmail(email) {
  const target = email.trim().toLowerCase();
  return getUsers().find((u) => u.email.toLowerCase() === target) || null;
}

/**
 * ตรวจสอบอีเมล/รหัสผ่านสำหรับหน้า Login
 * @returns {object|null} ผู้ใช้ ถ้าอีเมล/รหัสผ่านถูกต้อง, null ถ้าไม่พบหรือรหัสผ่านผิด
 * @throws {Error} ถ้าบัญชีถูกระงับการใช้งาน (suspended)
 */
export function authenticate(email, password) {
  const user = findUserByEmail(email);
  if (!user || user.password !== password) return null;
  if (user.status === "suspended") {
    throw new Error("บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ");
  }
  return user;
}

/**
 * สมัครสมาชิกใหม่จากหน้า Register — default role เป็น CUSTOMER, status active
 * @param {{fullName:string,email:string,phone?:string,password:string}} data
 * @returns {object} ผู้ใช้ที่ถูกสร้างขึ้น
 * @throws {Error} ถ้าอีเมลนี้ถูกใช้งานแล้ว
 */
export function registerUser({ fullName, email, phone, password }) {
  const users = getUsers();
  const normalizedEmail = email.trim().toLowerCase();
  if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    throw new Error("อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น");
  }

  const id = nextId(users);
  const now = new Date();
  const newUser = {
    id,
    name: fullName.trim(),
    email: email.trim(),
    phone: phone?.trim() || "",
    password,
    role: "CUSTOMER",
    status: "active",
    joined: formatThaiDate(now),
    createdAt: now.toISOString(),
    avatar: `https://i.pravatar.cc/64?img=${(id % 70) + 1}`,
  };
  const updated = [newUser, ...users];
  writeRaw(updated);
  return newUser;
}

// ---------- Session (สถานะ login ปัจจุบัน) ----------
// ใช้ key เดียวกันทั้งระบบ ไม่ว่าจะ login ผ่านหน้า Login หรือ Register
// เก็บเฉพาะข้อมูลที่จำเป็นต่อ UI เท่านั้น (ไม่เก็บ password)

const SESSION_KEY = "farmart_session";

/** บันทึก session หลัง login/register สำเร็จ */
export function saveSession(user, keepSignedIn = false) {
  const session = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    keepSignedIn,
    loggedInAt: new Date().toISOString(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

/** ดึง session ปัจจุบัน (null ถ้ายังไม่ได้ login) */
export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** ล้าง session (logout) */
export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}