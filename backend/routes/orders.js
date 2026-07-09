const express = require("express");
const router = express.Router();
const orderModel = require("../models/orderModel");
const { requireAuth, requireRole } = require("../middleware/auth");

// GET /api/orders - ลูกค้าเห็นเฉพาะของตัวเอง / employee-admin เห็นทั้งหมด
router.get("/", requireAuth, (req, res) => {
  const isStaff = req.user.role === "EMPLOYEE" || req.user.role === "ADMIN";
  const orders = isStaff ? orderModel.getOrders() : orderModel.getOrdersByUser(req.user.id);
  res.json({ orders });
});

// GET /api/orders/:id
router.get("/:id", requireAuth, (req, res) => {
  const order = orderModel.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: "ไม่พบคำสั่งซื้อ" });
  const isStaff = req.user.role === "EMPLOYEE" || req.user.role === "ADMIN";
  if (!isStaff && order.userId !== req.user.id) {
    return res.status(403).json({ error: "ไม่มีสิทธิ์เข้าถึงคำสั่งซื้อนี้" });
  }
  res.json({ order });
});

// POST /api/orders - สร้างคำสั่งซื้อใหม่ (checkout)
router.post("/", requireAuth, (req, res) => {
  const { items, address, paymentMethod } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "ตะกร้าสินค้าว่างเปล่า" });
  }
  const order = orderModel.createOrder({
    userId: req.user.id,
    customer: req.user.name,
    items,
    address,
    paymentMethod,
  });
  res.status(201).json({ order });
});

// PATCH /api/orders/:id/status  (employee/admin) - pending/approved/rejected
router.patch("/:id/status", requireRole("EMPLOYEE", "ADMIN"), (req, res) => {
  const { status } = req.body || {};
  if (!["pending", "approved", "rejected"].includes(status)) {
    return res.status(400).json({ error: "status ไม่ถูกต้อง" });
  }
  const order = orderModel.updateOrderStatus(req.params.id, status);
  if (!order) return res.status(404).json({ error: "ไม่พบคำสั่งซื้อ" });
  res.json({ order });
});

// PATCH /api/orders/:id/advance  (employee/admin) - เลื่อนสถานะการจัดส่งไปขั้นถัดไป (ใช้กับหน้า Tracking)
router.patch("/:id/advance", requireRole("EMPLOYEE", "ADMIN"), (req, res) => {
  const order = orderModel.advanceOrderStep(req.params.id);
  if (!order) return res.status(404).json({ error: "ไม่พบคำสั่งซื้อ" });
  res.json({ order });
});

module.exports = router;
