// routes/notifications.js
const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { requireAuth, requireRole } = require("../middleware/auth");

// แจ้งเตือนเป็นข้อมูลส่วนตัวของแต่ละ user ทุก endpoint จึงต้อง login ก่อนเสมอ
router.use(requireAuth);

// GET /api/notifications - แจ้งเตือนของตัวเอง
router.get("/", notificationController.getNotifications);

// PUT /api/notifications/read-all - อ่านทั้งหมด
// หมายเหตุ: ต้องประกาศ route นี้ไว้ "ก่อน" /:id/read ไม่งั้น express จะจับคำว่า
// "read-all" เป็นค่า :id แทน (route ชนกัน)
router.put("/read-all", notificationController.markAllAsRead);

// PUT /api/notifications/:id/read - อ่านรายการเดียว
router.put("/:id/read", notificationController.markAsRead);

// DELETE /api/notifications/:id
router.delete("/:id", notificationController.deleteNotification);

// POST /api/notifications (admin only) - ยิงแจ้งเตือน/โปรโมชั่นเอง
router.post("/", requireRole("ADMIN", "EMPLOYEE"), notificationController.createNotification);

module.exports = router;