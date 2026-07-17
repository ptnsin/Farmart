// authStore.js
// จัดการ login/logout และ "ใครกำลังใช้งานอยู่" ผ่าน backend จริง (routes/auth.js)
// หลัง login สำเร็จ token จะถูกเก็บไว้ใน localStorage ผ่าน apiClient.js
// แล้วทุก request ต่อไปที่ยิงผ่าน api.* จะแนบ Authorization header ให้อัตโนมัติ

import { api, setToken, clearToken, getToken } from "./apiClient";

const CURRENT_USER_KEY = "farmart_current_user";

function cacheUser(user) {
  if (user) localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(CURRENT_USER_KEY);

  // แจ้งส่วนอื่นของแอป (เช่น CartContext) ว่า user ปัจจุบันเปลี่ยนแล้ว
  // (login / register / logout) เพื่อให้โหลดข้อมูลที่ผูกกับ user ใหม่ให้ถูกต้อง
  // ไม่ทำแบบนี้แล้วตะกร้าจะค้างเป็นของ user/guest คนก่อนหน้า เพราะ CartProvider
  // mount แค่ครั้งเดียวที่ root และ navigate() แบบ SPA ไม่ทำให้มัน re-mount
  window.dispatchEvent(new Event("userChanged"));
}

/** เข้าสู่ระบบ คืนค่า user ถ้าสำเร็จ, throw Error พร้อมข้อความถ้าไม่สำเร็จ */
export async function login(email, password, keepSignedIn = false) {
  const data = await api.post("/api/auth/login", { email, password, keepSignedIn });
  setToken(data.token);
  cacheUser(data.user);
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
}

/** ดึงข้อมูล user ปัจจุบันจาก backend (ยืนยันว่า token ยังใช้ได้จริง) */
export async function fetchCurrentUser() {
  const data = await api.get("/api/auth/me");
  cacheUser(data.user);
  return data.user;
}

/**
 * แก้ไขโปรไฟล์ของตัวเอง (PUT /api/auth/me) — ใช้ได้ทุก role เพราะแก้ได้แค่ของตัวเอง
 * ห้ามส่ง role/status ไปเปลี่ยนเอง (backend จะตัดทิ้งอยู่แล้วแต่กันไว้ก่อน)
 * @param {{name?:string, email?:string, phone?:string, avatar?:string, password?:string}} patch
 * @returns {object} user ที่อัปเดตแล้ว
 * @throws {Error} เช่น "อีเมลนี้ถูกใช้งานแล้ว"
 */
export async function updateMe(patch) {
  const data = await api.put("/api/auth/me", patch);
  cacheUser(data.user);
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