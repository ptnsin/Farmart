// models/orderModel.js
const db = require("../utils/db");
const SEED = require("../data/orders.seed.json");

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

function createOrder({ userId, customer, items, address, paymentMethod }) {
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
  };
  saveOrders([order, ...orders]);
  return order;
}

function updateOrderStatus(id, status) {
  const orders = getOrders().map((o) => (o.id === id ? { ...o, status } : o));
  saveOrders(orders);
  return orders.find((o) => o.id === id) || null;
}

/** แก้ไขคำสั่งซื้อแบบทั่วไป (ใช้กับ PUT /api/orders/:id) */
function updateOrder(id, patch) {
  const safePatch = { ...patch };
  delete safePatch.id;
  delete safePatch.userId;
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
};
