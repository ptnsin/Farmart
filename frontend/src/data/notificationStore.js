// notificationStore.js
// ระบบแจ้งเตือนที่เก็บข้อมูลจริงลง localStorage (ทำหน้าที่แทน backend ไปก่อน)
// โครงสร้างฟังก์ชันเลียนแบบ addressStore.js (fetch.../create.../delete...) และเป็น async
// ทั้งหมด เพื่อให้ภายหลังสลับไปยิง API จริงได้ง่าย โดยไม่ต้องแก้โค้ดฝั่ง component

const STORAGE_KEY = "farmart_notifications";
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

// ---------- seed ข้อมูลตัวอย่าง (โปรโมชั่น) ตอนยังไม่มีอะไรใน localStorage ----------
function seedNotifications() {
  const now = Date.now();
  return [
    {
      id: crypto.randomUUID(),
      type: "promotion",
      title: "โปรโมชั่นพิเศษ! ลด 20%",
      message: "ผักออร์แกนิกทุกชนิด ลดสูงสุด 20% วันนี้ถึงสิ้นเดือนเท่านั้น",
      read: false,
      createdAt: now - 1000 * 60 * 5, // 5 นาทีที่แล้ว
    },
    {
      id: crypto.randomUUID(),
      type: "order",
      title: "คำสั่งซื้อของคุณกำลังจัดส่ง",
      message: "พัสดุออกจากคลังสินค้าแล้ว คาดว่าจะถึงภายใน 1-2 วัน",
      read: false,
      createdAt: now - 1000 * 60 * 60 * 3, // 3 ชั่วโมงที่แล้ว
    },
    {
      id: crypto.randomUUID(),
      type: "promotion",
      title: "ส่งฟรี! เมื่อซื้อครบ 500 บาท",
      message: "ช้อปสินค้าครบ 500 บาทขึ้นไป รับสิทธิ์จัดส่งฟรีทันที",
      read: true,
      createdAt: now - 1000 * 60 * 60 * 24, // 1 วันที่แล้ว
    },
  ];
}

function readRaw() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = seedNotifications();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeRaw(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  emitChange(list);
  return list;
}

// จำลอง latency ของ network เล็กน้อยให้ความรู้สึกเหมือนเรียก backend จริง
function delay(ms = 200) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------- public API ----------

// อ่านค่าที่ cache ไว้ทันที ไม่ต้องรอ await (ใช้ตอน mount ครั้งแรกให้ UI ไม่กระพริบ)
export function getCachedNotifications() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function fetchNotifications() {
  await delay();
  return readRaw().sort((a, b) => b.createdAt - a.createdAt);
}

export async function markAsRead(id) {
  await delay(100);
  const list = readRaw().map((n) => (n.id === id ? { ...n, read: true } : n));
  return writeRaw(list);
}

export async function markAllAsRead() {
  await delay(100);
  const list = readRaw().map((n) => ({ ...n, read: true }));
  return writeRaw(list);
}

export async function deleteNotification(id) {
  await delay(100);
  const list = readRaw().filter((n) => n.id !== id);
  return writeRaw(list);
}

// ใช้เพิ่มแจ้งเตือนใหม่ เช่น ตอนแอดมินยิงโปรโมชั่น หรือระบบ order สร้างแจ้งเตือนอัตโนมัติ
export async function addNotification({ type = "promotion", title, message }) {
  await delay(100);
  const list = readRaw();
  const next = [
    {
      id: crypto.randomUUID(),
      type,
      title,
      message,
      read: false,
      createdAt: Date.now(),
    },
    ...list,
  ];
  return writeRaw(next);
}

export function unreadCount(list) {
  return list.filter((n) => !n.read).length;
}