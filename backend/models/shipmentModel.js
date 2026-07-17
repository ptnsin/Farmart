// models/shipmentModel.js
const db = require("../utils/db");
const SEED = require("../data/shipments.json");
const orderModel = require("./orderModel");

const NEXT_STATUS = { preparing: "in_transit", in_transit: "delivered" };

// shipment.status (preparing/in_transit/delivered) กับ order.status (pending/approved/preparing/
// shipping/delivered/...) เป็นคนละ enum กัน — ต้อง map ไปด้วยกันทุกครั้งที่ shipment เปลี่ยนสถานะ
// ไม่งั้นหน้า EmployeeShipping.jsx (ซึ่งโชว์สถานะจาก order ไม่ใช่จาก shipment โดยตรง) จะค้างสถานะเก่า
const SHIPMENT_TO_ORDER_STATUS = {
  preparing: "preparing",
  in_transit: "shipping",
  delivered: "delivered",
};

/** sync order.status ให้ตรงกับ shipment.status ปัจจุบัน (เงียบ ๆ ถ้าไม่มี order ผูกอยู่) */
function syncOrderStatus(shipment) {
  if (!shipment || !shipment.order) return;
  const orderStatus = SHIPMENT_TO_ORDER_STATUS[shipment.status];
  if (!orderStatus) return;
  orderModel.updateOrderStatus(shipment.order, orderStatus);
}

function getShipments() {
  return db.read("shipments", SEED);
}

function saveShipments(shipments) {
  return db.write("shipments", shipments);
}

function getShipmentById(id) {
  return getShipments().find((s) => s.id === id) || null;
}

/** แก้ไขข้อมูลการจัดส่งแบบทั่วไป (ใช้กับ PUT /api/shipments/:id) */
function updateShipment(id, patch) {
  const safePatch = { ...patch };
  delete safePatch.id;
  const shipments = getShipments().map((s) => (s.id === id ? { ...s, ...safePatch, id: s.id } : s));
  saveShipments(shipments);
  const updated = shipments.find((s) => s.id === id) || null;
  if (safePatch.status) syncOrderStatus(updated);
  return updated;
}

/** ลบข้อมูลการจัดส่ง */
function deleteShipment(id) {
  const shipments = getShipments().filter((s) => s.id !== id);
  saveShipments(shipments);
  return shipments;
}

function advanceShipment(id) {
  const shipments = getShipments().map((s) =>
    s.id === id && NEXT_STATUS[s.status] ? { ...s, status: NEXT_STATUS[s.status] } : s
  );
  saveShipments(shipments);
  const updated = shipments.find((s) => s.id === id) || null;
  syncOrderStatus(updated);
  return updated;
}

function createShipment(data) {
  const shipments = getShipments();
  const nums = shipments.map((s) => Number(String(s.id).replace(/\D/g, ""))).filter((n) => !Number.isNaN(n));
  const nextNum = (nums.length ? Math.max(...nums) : 5520) + 1;
  const shipment = {
    id: `SHP-${nextNum}`,
    order: data.order,
    carrier: data.carrier || "Farmart Express",
    status: "preparing",
    eta: data.eta || "",
  };
  saveShipments([shipment, ...shipments]);
  syncOrderStatus(shipment);
  return shipment;
}

module.exports = {
  getShipments,
  saveShipments,
  getShipmentById,
  updateShipment,
  deleteShipment,
  advanceShipment,
  createShipment,
};