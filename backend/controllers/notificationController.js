// controllers/notificationController.js
const notificationModel = require("../models/notificationModel");

// TODO: ตรวจสอบว่า models/userModel.js มีฟังก์ชันชื่อนี้จริงหรือไม่ (เดาตามแบบแผนของ
// productModel.getProducts()) ถ้าชื่อไม่ตรง ให้แก้ import/เรียกใช้ในฟังก์ชัน createNotification ด้านล่าง
const userModel = require("../models/userModel");

// ค่า default ต้องตรงกับ DEFAULT_NOTIFICATIONS ฝั่ง frontend (AdminSettings.jsx)
// ใช้ตอน user ยังไม่เคยกดบันทึกการตั้งค่าแจ้งเตือนเลยสักครั้ง (ไม่มี notifyPreferences ใน record)
const DEFAULT_NOTIFY_PREFERENCES = {
  pendingApproval: true,
  lowStock: true,
  newUser: true,
  weeklyReport: false,
  newOrder: true,
};

/** GET /api/notifications - แจ้งเตือนของ user ที่ login อยู่เท่านั้น (กรองตาม preference ของ user ด้วย) */
function getNotifications(req, res) {
  const notifications = notificationModel.getNotificationsByUser(req.user.id);

  // ดึงข้อมูล user สดจาก DB แทนที่จะพึ่ง req.user เฉย ๆ เผื่อ token payload
  // เก็บ user snapshot ตอน login ไว้ ไม่มี notifyPreferences ล่าสุด
  const user = userModel.getUserById(req.user.id);
  const prefs = { ...DEFAULT_NOTIFY_PREFERENCES, ...(user?.notifyPreferences || {}) };

  // ถ้า notification ไม่มี type ที่ตรงกับ key ไหนเลย (เช่น type ใหม่ที่ยังไม่ได้เพิ่มใน
  // DEFAULT_NOTIFY_PREFERENCES) ให้แสดงไว้ก่อนเป็นค่า default (ปลอดภัยกว่าซ่อนไปเงียบ ๆ)
  const filtered = notifications.filter((n) => prefs[n.type] !== false);

  res.json({ notifications: filtered, total: filtered.length });
}

/** PUT /api/notifications/:id/read - อ่านแจ้งเตือนรายการเดียว (ต้องเป็นเจ้าของเท่านั้น) */
function markAsRead(req, res) {
  const existing = notificationModel.getNotificationById(req.params.id);
  if (!existing) return res.status(404).json({ error: "ไม่พบการแจ้งเตือนนี้" });
  if (String(existing.userId) !== String(req.user.id)) {
    return res.status(403).json({ error: "ไม่มีสิทธิ์เข้าถึงการแจ้งเตือนนี้" });
  }

  const notification = notificationModel.markAsRead(req.params.id);
  res.json({ notification });
}

/** PUT /api/notifications/read-all - อ่านแจ้งเตือนทั้งหมดของตัวเอง */
function markAllAsRead(req, res) {
  const notifications = notificationModel.markAllAsRead(req.user.id);
  res.json({ notifications });
}

/** DELETE /api/notifications/:id - ลบแจ้งเตือน (ต้องเป็นเจ้าของเท่านั้น) */
function deleteNotification(req, res) {
  const existing = notificationModel.getNotificationById(req.params.id);
  if (!existing) return res.status(404).json({ error: "ไม่พบการแจ้งเตือนนี้" });
  if (String(existing.userId) !== String(req.user.id)) {
    return res.status(403).json({ error: "ไม่มีสิทธิ์ลบการแจ้งเตือนนี้" });
  }

  const notifications = notificationModel.deleteNotificationForUser(req.params.id, req.user.id);
  res.json({ notifications, message: "ลบการแจ้งเตือนเรียบร้อยแล้ว" });
}

/**
 * POST /api/notifications (admin only) - สร้างแจ้งเตือนเอง เช่น ยิงโปรโมชั่นหาลูกค้า
 * body รองรับ 3 แบบ:
 *  - { userId, type, title, message }              -> ส่งให้ user คนเดียว
 *  - { userIds: [...], type, title, message }       -> ส่งให้ user ตาม id ที่ระบุ
 *  - { broadcast: true, role, type, title, message } -> ส่งให้ user ทุกคน (กรอง role ได้ถ้าระบุ)
 */
function createNotification(req, res) {
  const { userId, userIds, broadcast, role, type, title, message } = req.body || {};

  if (!title || !message) {
    return res.status(400).json({ error: "กรุณากรอกหัวข้อและข้อความแจ้งเตือนให้ครบถ้วน" });
  }

  if (broadcast) {
    const allUsers = userModel.getUsers();
    const targets = role ? allUsers.filter((u) => u.role === role) : allUsers;
    const notifications = notificationModel.addNotificationForUsers(
      targets.map((u) => u.id),
      { type, title, message }
    );
    return res.status(201).json({ notifications });
  }

  if (Array.isArray(userIds) && userIds.length > 0) {
    const notifications = notificationModel.addNotificationForUsers(userIds, {
      type,
      title,
      message,
    });
    return res.status(201).json({ notifications });
  }

  if (!userId) {
    return res.status(400).json({ error: "กรุณาระบุ userId, userIds หรือ broadcast" });
  }
  const notification = notificationModel.addNotification({ userId, type, title, message });
  res.status(201).json({ notification });
}

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
};