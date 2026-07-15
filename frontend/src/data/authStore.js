// authStore.js
// จัดการ login/logout และ "ใครกำลังใช้งานอยู่" ผ่าน backend จริง (routes/auth.js)
// หลัง login สำเร็จ token จะถูกเก็บไว้ใน localStorage ผ่าน apiClient.js
// แล้วทุก request ต่อไปที่ยิงผ่าน api.* จะแนบ Authorization header ให้อัตโนมัติ

import { api, setToken, clearToken, getToken } from "./apiClient";

const CURRENT_USER_KEY = "farmart_current_user";

function cacheUser(user) {
  if (user) localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(CURRENT_USER_KEY);
}

/** เข้าสู่ระบบ คืนค่า user ถ้าสำเร็จ, throw Error พร้อมข้อความถ้าไม่สำเร็จ */
export async function login(email, password, keepSignedIn = false) {
  const data = await api.post("/api/auth/login", { email, password, keepSignedIn });
  setToken(data.token);
  cacheUser(data.user);
  window.dispatchEvent(new Event("userChanged"));
  return data.user;
}

/**
 * สมัครสมาชิกใหม่ (role CUSTOMER เท่านั้น ตาม authController.register)
 * สมัครสำเร็จแล้ว backend จะออก token ให้เลย เก็บไว้เหมือน login สำเร็จ
 * @param {{name:string, email:string, phone?:string, password:string}} data
 * @returns {object} user ที่สมัครสำเร็จ
 * @throws {Error} เช่น "อีเมลนี้ถูกใช้งานแล้ว" หรือกรอกข้อมูลไม่ครบ
 */
export async function register(data) {
  const res = await api.post("/api/auth/register", data);
  setToken(res.token);
  cacheUser(res.user);
  window.dispatchEvent(new Event("userChanged"));
  return res.user;
}

/** ออกจากระบบ (แจ้ง backend ให้ลบ session ด้วย) */
export async function logout() {
  try {
    await api.post("/api/auth/logout");
  } catch {
    // ถึง logout ฝั่ง server จะพลาด (เช่น token หมดอายุไปแล้ว) ก็ยังเคลียร์ token ฝั่ง client ต่อ
  }
  clearToken();
  cacheUser(null);
  window.dispatchEvent(new Event("userChanged"));
}

/** ดึงข้อมูล user ปัจจุบันจาก backend (ยืนยันว่า token ยังใช้ได้จริง) */
export async function fetchCurrentUser() {
  const data = await api.get("/api/auth/me");
  cacheUser(data.user);
  return data.user;
}

/**
 * อัปเดตข้อมูลโปรไฟล์ของผู้ใช้ปัจจุบัน (name / email / phone)
 * เรียก PUT /api/auth/me แล้วอัปเดต cache + แจ้ง userChanged เพื่อให้ทุกที่ที่ใช้ getCachedUser() sync กัน
 * @param {{name?:string, email?:string, phone?:string}} patch
 * @returns {object} user ที่อัปเดตแล้ว
 * @throws {Error} เช่น "รูปแบบอีเมลไม่ถูกต้อง"
 */
export async function updateProfile(patch) {
  const data = await api.put("/api/auth/me", patch);
  cacheUser(data.user);
  window.dispatchEvent(new Event("userChanged"));
  return data.user;
}

/** ดึงข้อมูล user ที่แคชไว้แบบเร็ว ๆ (sync, ไม่เช็คกับ server) ใช้โชว์ UI ทันทีระหว่างรอ fetchCurrentUser */
export function getCachedUser() {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(getToken());
}
