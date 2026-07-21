// notificationStore.js
// เดิมไฟล์นี้เก็บข้อมูลแจ้งเตือนไว้ใน localStorage เอง (mock ตอนยังไม่มี backend)
// ตอนนี้ backend มี /api/notifications ให้แล้ว จึงเปลี่ยนไปเรียกผ่าน apiClient.js แทน
// ฟังก์ชันและ signature เดิมทั้งหมดยังคงเหมือนเดิมทุกตัว (ชื่อฟังก์ชัน, async, พารามิเตอร์)
// เพื่อให้ component ที่ import ไฟล์นี้ไปใช้อยู่แล้ว (เช่น NotificationBell) ไม่ต้องแก้อะไรเลย
//
// หมายเหตุ field ที่ backend คืนมา (อิงจาก controllers/notificationController.js จริง):
// - GET  /api/notifications           -> { notifications: [...], total }
// - PUT  /api/notifications/:id/read  -> { notification: {...} }
// - PUT  /api/notifications/read-all  -> { notifications: [...] }
// - DELETE /api/notifications/:id     -> { notifications: [...], message }
// - POST /api/notifications (admin)   -> { notification: {...} } หรือ { notifications: [...] } ถ้ายิงหลาย user
//
// ทุก endpoint ต้อง login ก่อน (ดู routes/notifications.js) ถ้ายังไม่ login จะได้ error
// "กรุณาเข้าสู่ระบบก่อนใช้งาน" (401) กลับมา

import { api } from "./apiClient";

const CACHE_KEY = "farmart_notifications_cache";
const listeners = new Set();

// ---------- pub/sub เล็ก ๆ เพื่อให้ NotificationBell รู้ทันทีเมื่อมีการเปลี่ยนแปลง ----------
function emitChange(list) {
  listeners.forEach((cb) => {
    try {
      cb(list);
    } catch {
      /* ignore listener errors */
    }
  });
}

export function subscribeNotifications(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

/** เก็บ cache ไว้ใน localStorage (ใช้แค่โชว์ UI ทันทีตอน mount ครั้งแรก ไม่ใช่ source of truth) */
function cache(list) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(list));
  } catch {
    // เก็บ cache ไม่ได้ก็ไม่เป็นไร ข้อมูลจริงยังอยู่บน backend ปกติ
  }
  emitChange(list);
  return list;
}

// ---------- public API (signature เหมือนเดิมทุกตัว ของเดิมเรียกยังไงเรียกแบบเดิมได้เลย) ----------

/** อ่านค่าที่ cache ไว้ทันที ไม่ต้องรอ await (ใช้ตอน mount ครั้งแรกให้ UI ไม่กระพริบ) */
export function getCachedNotifications() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function fetchNotifications() {
  const data = await api.get("/api/notifications");
  return cache(data.notifications);
}

/**
 * ใช้เรียกแบบ sync ทันที (ไม่ต้อง await) เช่นตอน component mount หรือ toggle เปิด dropdown
 * - คืนค่า cache ที่มีอยู่ก่อน เพื่อให้ UI ไม่กระพริบ / ไม่ต้องรอ backend
 * - ยิง fetchNotifications() ต่อเบื้องหลังเพื่ออัปเดต cache ให้ล่าสุด
 *   (เมื่อโหลดเสร็จจะ emitChange ให้เอง ถ้า component subscribe ไว้ก็จะได้ค่าล่าสุดอัตโนมัติ)
 */
export function getNotifications() {
  fetchNotifications().catch(() => {
    // ดึงจาก backend ไม่สำเร็จ (เช่นยังไม่ login) ก็ปล่อยผ่าน ใช้ค่า cache เดิมไปก่อน
  });
  return getCachedNotifications() || [];
}

/** แปลงเวลาเป็นข้อความสัมพัทธ์แบบภาษาไทย เช่น "5 นาทีที่แล้ว" */
export function formatRelativeTime(dateInput) {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return "เมื่อสักครู่";

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} ชั่วโมงที่แล้ว`;

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay} วันที่แล้ว`;

  const diffWeek = Math.floor(diffDay / 7);
  if (diffDay < 30) return `${diffWeek} สัปดาห์ที่แล้ว`;

  const diffMonth = Math.floor(diffDay / 30);
  if (diffDay < 365) return `${diffMonth} เดือนที่แล้ว`;

  const diffYear = Math.floor(diffDay / 365);
  return `${diffYear} ปีที่แล้ว`;
}

export async function markAsRead(id) {
  const data = await api.put(`/api/notifications/${id}/read`, {});
  // backend คืนแค่รายการเดียวที่อ่าน จึง merge เข้ากับ cache เดิมแทนที่จะ fetch ใหม่ทั้งก้อน
  const list = (getCachedNotifications() || []).map((n) =>
    n.id === data.notification.id ? data.notification : n
  );
  return cache(list);
}

export async function markAllAsRead() {
  const data = await api.put("/api/notifications/read-all", {});
  return cache(data.notifications);
}

export async function deleteNotification(id) {
  const data = await api.delete(`/api/notifications/${id}`);
  return cache(data.notifications);
}

/**
 * สร้างแจ้งเตือนใหม่ (ฝั่ง backend อนุญาตเฉพาะ ADMIN) เช่น ตอนแอดมินยิงโปรโมชั่นหาลูกค้า
 * @param {{type?:string, title:string, message:string, userId?:number|string, userIds?:Array, broadcast?:boolean, role?:string}} data
 */
export async function addNotification(data) {
  const res = await api.post("/api/notifications", data);
  if (res.notification) {
    // สร้างให้ user เดียว ถ้าเป็นตัวเราเองก็อัปเดต cache ได้ทันที
    const list = [res.notification, ...(getCachedNotifications() || [])];
    return cache(list);
  }
  // สร้างให้หลาย user (broadcast/userIds) แจ้งเตือนของคนอื่นไม่ควรอยู่ใน cache ของเรา
  // ดึงของตัวเองใหม่จาก backend แทน ให้ชัวร์ว่า cache ตรงกับสิทธิ์ของ user ปัจจุบัน
  return fetchNotifications();
}

export function unreadCount(list) {
  return list.filter((n) => !n.read).length;
}