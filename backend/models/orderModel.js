// models/orderModel.js
const db = require("../utils/db");
const SEED = require("../data/orders.json");

function getOrders() {
  return db.read("orders", SEED);
}

function saveOrders(orders) {
  return db.write("orders", orders);
}

function getOrderById(id) {
  return getOrders().find((o) => o.id === id) || null;
}

function getOrdersByUser(userId) {
  return getOrders().filter((o) => o.userId === Number(userId));
}

function nextOrderId(orders) {
  const nums = orders
    .map((o) => Number(String(o.id).replace(/\D/g, "")))
    .filter((n) => !Number.isNaN(n));
  const max = nums.length ? Math.max(...nums) : 10230;
  return `ORD-${max + 1}`;
}

const STEP_LABELS = [
  "ยืนยันคำสั่งซื้อ",
  "เตรียมพัสดุ",
  "กำลังจัดส่ง",
  "ถึงจุดหมาย",
  "จัดส่งสำเร็จ",
];

// สถานะ (status) แต่ละค่า -> statusLabel/statusStep ที่ต้อง sync กันเวลาเปลี่ยนสถานะ
// (VALID_STATUSES ฝั่ง controller: pending, approved, rejected, preparing, shipping, delivered, cancelled)
// หมายเหตุ: "delivered" ถูกเพิ่มเข้ามาเพื่อให้ order มี status ที่ map ไปหา step สุดท้าย (จัดส่งสำเร็จ)
// ให้ตรงกับตอนที่ shipmentModel.advanceShipment() เปลี่ยน shipment.status เป็น "delivered"
const STATUS_META = {
  pending: { statusLabel: "รอการตรวจสอบ", statusStep: 0 },
  approved: { statusLabel: STEP_LABELS[0], statusStep: 0 },
  preparing: { statusLabel: STEP_LABELS[1], statusStep: 1 },
  shipping: { statusLabel: STEP_LABELS[2], statusStep: 2 },
  delivered: { statusLabel: STEP_LABELS[4], statusStep: 4 },
  rejected: { statusLabel: "ปฏิเสธแล้ว", statusStep: 0 },
  cancelled: { statusLabel: "ยกเลิกแล้ว", statusStep: 0 },
};

function createOrder({ userId, customer, items, address, paymentMethod, deliveryMethod }) {
  const orders = getOrders();
  const id = nextOrderId(orders);
  const total = items.reduce((sum, i) => sum + Number(i.price) * Number(i.quantity), 0);
  const order = {
    id,
    userId: Number(userId),
    customer,
    items,
    total,
    date: new Date().toISOString().slice(0, 10),
    status: "pending",
    statusStep: 0,
    statusLabel: STEP_LABELS[0],
    address: address || "",
    paymentMethod: paymentMethod || "cod",
    // ใช้กำหนด ETA ของ shipment ตอน sync (ดู DELIVERY_ETA_DAYS ใน orderController.js)
    deliveryMethod: deliveryMethod === "express" ? "express" : "standard",
  };
  saveOrders([order, ...orders]);
  return order;
}

function updateOrderStatus(id, status) {
  const meta = STATUS_META[status] || {};
  const orders = getOrders().map((o) =>
    o.id === id ? { ...o, status, ...meta } : o
  );
  saveOrders(orders);
  return orders.find((o) => o.id === id) || null;
}

/** แก้ไขคำสั่งซื้อแบบทั่วไป (ใช้กับ PUT /api/orders/:id) */
function updateOrder(id, patch) {
  const safePatch = { ...patch };
  delete safePatch.id;
  delete safePatch.userId;
  // ถ้ามีการเปลี่ยน status ผ่านทางนี้ด้วย ต้อง sync statusLabel/statusStep ให้ตรงกันเหมือน updateOrderStatus
  if (safePatch.status) {
    Object.assign(safePatch, STATUS_META[safePatch.status] || {});
  }
  const orders = getOrders().map((o) => (o.id === id ? { ...o, ...safePatch, id: o.id } : o));
  saveOrders(orders);
  return orders.find((o) => o.id === id) || null;
}

/** ลบคำสั่งซื้อ */
function deleteOrder(id) {
  const orders = getOrders().filter((o) => o.id !== id);
  saveOrders(orders);
  return orders;
}

function advanceOrderStep(id) {
  const orders = getOrders().map((o) => {
    if (o.id !== id) return o;
    const nextStep = Math.min(o.statusStep + 1, STEP_LABELS.length - 1);
    return { ...o, statusStep: nextStep, statusLabel: STEP_LABELS[nextStep] };
  });
  saveOrders(orders);
  return orders.find((o) => o.id === id) || null;
}

module.exports = {
  getOrders,
  saveOrders,
  getOrderById,
  getOrdersByUser,
  createOrder,
  updateOrderStatus,
  updateOrder,
  deleteOrder,
  advanceOrderStep,
  STEP_LABELS,
  STATUS_META,
};