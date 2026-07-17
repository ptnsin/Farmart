// routes/orders.js
const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { requireAuth, requireRole } = require("../middleware/auth");

// GET /api/orders - ลูกค้าเห็นเฉพาะของตัวเอง / employee-admin เห็นทั้งหมด
router.get("/", requireAuth, orderController.getOrders);

// GET /api/orders/:id
router.get("/:id", requireAuth, orderController.getOrderById);

// POST /api/orders - สร้างคำสั่งซื้อใหม่ (checkout)
router.post("/", requireAuth, orderController.createOrder);

// PUT /api/orders/:id (employee/admin) - แก้ไขคำสั่งซื้อแบบทั่วไป
router.put("/:id", requireRole("EMPLOYEE", "ADMIN"), orderController.updateOrder);

// DELETE /api/orders/:id (employee/admin)
router.delete("/:id", requireRole("EMPLOYEE", "ADMIN"), orderController.deleteOrder);

// PATCH /api/orders/:id/status (employee/admin) - pending/approved/rejected
router.patch("/:id/status", requireRole("EMPLOYEE", "ADMIN"), orderController.updateStatus);

// PATCH /api/orders/:id/advance (employee/admin) - เลื่อนสถานะการจัดส่งไปขั้นถัดไป
router.patch("/:id/advance", requireRole("EMPLOYEE", "ADMIN"), orderController.advance);

// PATCH /api/orders/:id/cancel (ลูกค้าเจ้าของออเดอร์) - ยกเลิกคำสั่งซื้อก่อนเข้าสถานะกำลังจัดส่ง
router.patch("/:id/cancel", requireAuth, orderController.cancelOrder);

module.exports = router;