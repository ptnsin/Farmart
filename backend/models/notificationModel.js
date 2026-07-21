// models/notificationModel.js
// เขียนตามแบบแผนเดียวกับ productModel.js (db.read/db.write + SEED จาก data/*.json)
// แจ้งเตือนแต่ละรายการเป็นของ user คนใดคนหนึ่งเสมอ (field userId) เพราะทั้งฝั่งลูกค้า
// (โปรโมชั่น/สถานะคำสั่งซื้อ) และฝั่ง admin (สินค้ารออนุมัติ/สต็อกใกล้หมด ฯลฯ) ต้องเห็นเฉพาะ
// แจ้งเตือนของตัวเอง ไม่ปนกัน

const db = require("../utils/db");
const SEED = require("../data/notifications.json");

function getAllNotifications() {
  return db.read("notifications", SEED);
}

function saveNotifications(list) {
  return db.write("notifications", list);
}

/** แจ้งเตือนของ user คนเดียว เรียงใหม่สุดขึ้นก่อน */
function getNotificationsByUser(userId) {
  return getAllNotifications()
    .filter((n) => String(n.userId) === String(userId))
    .sort((a, b) => b.createdAt - a.createdAt);
}

function getNotificationById(id) {
  return getAllNotifications().find((n) => String(n.id) === String(id)) || null;
}

/**
 * สร้างแจ้งเตือนใหม่ให้ user คนเดียว
 * @param {{userId:number|string, type?:string, title:string, message:string}} data
 */
function addNotification({ userId, type = "general", title, message }) {
  const list = getAllNotifications();

  // กันแจ้งเตือนซ้ำ: ถ้ามี endpoint มากกว่า 1 จุดยิงมาแจ้งเรื่องเดียวกัน (เช่น สถานะ order
  // อัปเดตได้ทั้งจากหน้า "คำสั่งซื้อ" และหน้า "การขนส่ง") จะได้ไม่เห็นข้อความซ้ำกันเป๊ะภายในไม่กี่วินาที
  const DUPLICATE_WINDOW_MS = 5000;
  const now = Date.now();
  const duplicate = list.find(
    (n) =>
      String(n.userId) === String(userId) &&
      n.title === title &&
      n.message === message &&
      now - n.createdAt < DUPLICATE_WINDOW_MS
  );
  if (duplicate) return duplicate;

  const notification = {
    id: db.nextId(list),
    userId,
    type,
    title: title || "",
    message: message || "",
    read: false,
    createdAt: Date.now(),
  };
  saveNotifications([notification, ...list]);
  return notification;
}

/**
 * สร้างแจ้งเตือนเดียวกันให้หลาย user พร้อมกัน
 * ใช้ตอน broadcast โปรโมชั่น หรือแจ้ง admin ทุกคนพร้อมกันตอนมีสินค้ารออนุมัติ
 * @param {Array<number|string>} userIds
 * @param {{type?:string, title:string, message:string}} data
 */
function addNotificationForUsers(userIds, { type = "general", title, message }) {
  const list = getAllNotifications();
  let nextId = db.nextId(list);
  const created = userIds.map((userId) => ({
    id: nextId++,
    userId,
    type,
    title: title || "",
    message: message || "",
    read: false,
    createdAt: Date.now(),
  }));
  saveNotifications([...created, ...list]);
  return created;
}

function markAsRead(id) {
  const list = getAllNotifications().map((n) =>
    String(n.id) === String(id) ? { ...n, read: true } : n
  );
  saveNotifications(list);
  return list.find((n) => String(n.id) === String(id)) || null;
}

function markAllAsRead(userId) {
  const list = getAllNotifications().map((n) =>
    String(n.userId) === String(userId) ? { ...n, read: true } : n
  );
  saveNotifications(list);
  return getNotificationsByUser(userId);
}

function deleteNotification(id) {
  const list = getAllNotifications().filter((n) => String(n.id) !== String(id));
  saveNotifications(list);
  return list;
}

/** ลบแจ้งเตือนที่เป็นของ user คนเดียว คืน list ที่เหลือของ user คนนั้น (ใช้ตอบ response) */
function deleteNotificationForUser(id, userId) {
  deleteNotification(id);
  return getNotificationsByUser(userId);
}

module.exports = {
  getAllNotifications,
  saveNotifications,
  getNotificationsByUser,
  getNotificationById,
  addNotification,
  addNotificationForUsers,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteNotificationForUser,
};