// controllers/orderController.js
const orderModel = require("../models/orderModel");

function isStaff(user) {
  return user.role === "EMPLOYEE" || user.role === "ADMIN";
}

/** GET /api/orders - ลูกค้าเห็นเฉพาะของตัวเอง / employee-admin เห็นทั้งหมด รองรับ query: status */
function getOrders(req, res) {
  let orders = isStaff(req.user) ? orderModel.getOrders() : orderModel.getOrdersByUser(req.user.id);

  const { status } = req.query;
  if (status) {
    orders = orders.filter((o) => o.status === status);
  }

  res.json({ orders, total: orders.length });
}

/** GET /api/orders/:id */
function getOrderById(req, res) {
  const order = orderModel.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: "ไม่พบคำสั่งซื้อ" });

  if (!isStaff(req.user) && order.userId !== req.user.id) {
    return res.status(403).json({ error: "ไม่มีสิทธิ์เข้าถึงคำสั่งซื้อนี้" });
  }
  res.json({ order });
}

/** POST /api/orders - สร้างคำสั่งซื้อใหม่ (checkout) เฉพาะ CUSTOMER ที่ login แล้ว */
function createOrder(req, res) {
  const { items, address, paymentMethod } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "ตะกร้าสินค้าว่างเปล่า" });
  }
  for (const item of items) {
    if (!item.productId || !item.quantity || Number(item.quantity) <= 0 || item.price === undefined) {
      return res.status(400).json({ error: "รายการสินค้าในตะกร้าไม่ถูกต้อง" });
    }
  }

  const order = orderModel.createOrder({
    userId: req.user.id,
    customer: req.user.name,
    items,
    address,
    paymentMethod,
  });
  res.status(201).json({ order });
}

/** PUT /api/orders/:id (employee/admin) - แก้ไขคำสั่งซื้อแบบทั่วไป */
function updateOrder(req, res) {
  const existing = orderModel.getOrderById(req.params.id);
  if (!existing) return res.status(404).json({ error: "ไม่พบคำสั่งซื้อ" });

  const patch = { ...req.body };
  if (patch.status && !["pending", "approved", "rejected"].includes(patch.status)) {
    return res.status(400).json({ error: "status ไม่ถูกต้อง" });
  }

  const order = orderModel.updateOrder(req.params.id, patch);
  res.json({ order });
}

/** DELETE /api/orders/:id (employee/admin) */
function deleteOrder(req, res) {
  const existing = orderModel.getOrderById(req.params.id);
  if (!existing) return res.status(404).json({ error: "ไม่พบคำสั่งซื้อ" });

  const orders = orderModel.deleteOrder(req.params.id);
  res.json({ orders, message: "ลบคำสั่งซื้อเรียบร้อยแล้ว" });
}

/** PATCH /api/orders/:id/status (employee/admin) - pending/approved/rejected */
function updateStatus(req, res) {
  const { status } = req.body || {};
  if (!["pending", "approved", "rejected"].includes(status)) {
    return res.status(400).json({ error: "status ไม่ถูกต้อง" });
  }
  const order = orderModel.updateOrderStatus(req.params.id, status);
  if (!order) return res.status(404).json({ error: "ไม่พบคำสั่งซื้อ" });
  res.json({ order });
}

/** PATCH /api/orders/:id/advance (employee/admin) - เลื่อนสถานะการจัดส่งไปขั้นถัดไป */
function advance(req, res) {
  const order = orderModel.advanceOrderStep(req.params.id);
  if (!order) return res.status(404).json({ error: "ไม่พบคำสั่งซื้อ" });
  res.json({ order });
}

module.exports = { getOrders, getOrderById, createOrder, updateOrder, deleteOrder, updateStatus, advance };
