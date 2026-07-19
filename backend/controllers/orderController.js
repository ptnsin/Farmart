// controllers/orderController.js
const orderModel = require("../models/orderModel");
const shipmentModel = require("../models/shipmentModel");

// order.status -> shipment.status ที่ต้อง sync ไปด้วยทุกครั้งที่ order เปลี่ยนสถานะผ่าน endpoint นี้
// (shipmentModel.js sync กลับมาหา order ทางเดียวอยู่แล้วผ่าน syncOrderStatus แต่ order -> shipment
//  ไม่มีใครทำ ทำให้ก่อนหน้านี้พนักงานกด "เตรียมพัสดุ"/"กำลังจัดส่ง" จากหน้าคำสั่งซื้อแล้ว order.status
//  เปลี่ยนจริง แต่ไม่มี shipment ถูกสร้าง/อัปเดตให้ หน้าการขนส่งเลยไม่เห็นออเดอร์นั้นเลย)
const ORDER_TO_SHIPMENT_STATUS = {
  preparing: "preparing",
  shipping: "in_transit",
  delivered: "delivered",
};

// จำนวนวันที่ใช้คำนวณ ETA เริ่มต้นของ shipment ตอน auto-create ให้ตรงกับตัวเลือกวิธีจัดส่งที่ลูกค้า
// เลือกไว้ตอน Checkout (ดู SHIPPING_METHODS ใน Checkout.jsx: standard "3-5 วันทำการ", express "1-2 วันทำการ")
// ใช้ค่าสูงสุดของแต่ละช่วงเพื่อไม่ให้ ETA ที่แสดงดูเร็วเกินจริง
const DELIVERY_ETA_DAYS = { standard: 5, express: 2 };

/** สร้าง/อัปเดต shipment ของ order ให้ตรงกับสถานะล่าสุด ถ้า status ที่เปลี่ยนไปไม่เกี่ยวกับการขนส่ง (เช่น rejected/cancelled) จะไม่ทำอะไร */
function syncShipmentForOrder(order, status) {
  const shipmentStatus = ORDER_TO_SHIPMENT_STATUS[status];
  if (!shipmentStatus || !order) return;

  const existing = shipmentModel.getShipments().find((s) => s.order === order.id);
  if (existing) {
    if (existing.status !== shipmentStatus) {
      shipmentModel.updateShipment(existing.id, { status: shipmentStatus });
    }
    return;
  }

  // ยังไม่มี shipment ผูกกับ order นี้เลย -> สร้างใหม่ (createShipment ตั้งสถานะเริ่มต้นเป็น "preparing" เสมอ)
  // ใส่ eta default ให้ด้วย (ไม่งั้น createShipment จะปล่อยเป็นค่าว่าง "" ทำให้ EmployeeShipping.jsx
  // formatEta() คืนค่า null แล้วซ่อนแถว "กำหนดส่ง" ไปทั้งบรรทัด) — คำนวณตาม deliveryMethod ของ order
  const etaDays = DELIVERY_ETA_DAYS[order.deliveryMethod] ?? DELIVERY_ETA_DAYS.standard;
  const defaultEta = new Date(Date.now() + etaDays * 24 * 60 * 60 * 1000).toISOString();
  const created = shipmentModel.createShipment({ order: order.id, eta: defaultEta });
  if (shipmentStatus !== "preparing") {
    shipmentModel.updateShipment(created.id, { status: shipmentStatus });
  }
}

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
  const { items, address, paymentMethod, deliveryMethod } = req.body || {};

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
    deliveryMethod,
  });
  res.status(201).json({ order });
}

/** PUT /api/orders/:id (employee/admin) - แก้ไขคำสั่งซื้อแบบทั่วไป */
function updateOrder(req, res) {
  const existing = orderModel.getOrderById(req.params.id);
  if (!existing) return res.status(404).json({ error: "ไม่พบคำสั่งซื้อ" });

  const patch = { ...req.body };
  if (patch.status && !Object.keys(orderModel.STATUS_META).includes(patch.status)) {
    return res.status(400).json({ error: "status ไม่ถูกต้อง" });
  }

  const order = orderModel.updateOrder(req.params.id, patch);
  if (patch.status) syncShipmentForOrder(order, patch.status);
  res.json({ order });
}

/** DELETE /api/orders/:id (employee/admin) */
function deleteOrder(req, res) {
  const existing = orderModel.getOrderById(req.params.id);
  if (!existing) return res.status(404).json({ error: "ไม่พบคำสั่งซื้อ" });

  const orders = orderModel.deleteOrder(req.params.id);
  res.json({ orders, message: "ลบคำสั่งซื้อเรียบร้อยแล้ว" });
}

/** PATCH /api/orders/:id/status (employee/admin) - pending/approved/preparing/shipping/delivered/rejected/cancelled */
function updateStatus(req, res) {
  const { status } = req.body || {};
  if (!Object.keys(orderModel.STATUS_META).includes(status)) {
    return res.status(400).json({ error: "status ไม่ถูกต้อง" });
  }
  const order = orderModel.updateOrderStatus(req.params.id, status);
  if (!order) return res.status(404).json({ error: "ไม่พบคำสั่งซื้อ" });

  syncShipmentForOrder(order, status);

  res.json({ order });
}

/** PATCH /api/orders/:id/advance (employee/admin) - เลื่อนสถานะการจัดส่งไปขั้นถัดไป */
function advance(req, res) {
  const order = orderModel.advanceOrderStep(req.params.id);
  if (!order) return res.status(404).json({ error: "ไม่พบคำสั่งซื้อ" });
  res.json({ order });
}

/**
 * PATCH /api/orders/:id/cancel (ลูกค้าเจ้าของออเดอร์เท่านั้น) - ยกเลิกคำสั่งซื้อ
 * ยกเลิกได้เฉพาะก่อนเข้าสถานะ "กำลังจัดส่ง" (statusStep 2 ตาม STEP_LABELS ฝั่ง frontend:
 * 0 ยืนยันคำสั่งซื้อ, 1 เตรียมพัสดุ, 2 กำลังจัดส่ง, 3 ถึงจุดหมาย, 4 จัดส่งสำเร็จ)
 *
 * ตั้งใจไม่แก้ statusStep เดิม (เก็บไว้เป็นสถานะจัดส่งล่าสุดก่อนยกเลิก) แต่เพิ่มฟิลด์
 * `cancelled: true` แยกต่างหากเป็น source of truth แทน เพื่อไม่ให้ไปชนกับโค้ดอื่นที่
 * อ่าน statusStep เป็นตัวเลข 0-4 อยู่แล้ว (เช่น Tracking.jsx ที่เอาไปคำนวณตำแหน่งบนแผนที่)
 *
 * NOTE: ใช้ orderModel.updateOrder(id, patch) ตัวเดิมที่ updateOrder controller ใช้อยู่แล้ว
 * ไม่ได้เพิ่มฟังก์ชันใหม่ในโมเดล — ถ้า orderModel.updateOrder มีการ validate patch.status
 * เป็น whitelist ["pending","approved","rejected"] อยู่ภายใน (ไม่ใช่แค่ใน controller
 * ด้านบนนี้) จะต้องเพิ่ม "cancelled" เข้าไปใน whitelist นั้นด้วย ไม่งั้นจะถูก reject
 */
function cancelOrder(req, res) {
  const existing = orderModel.getOrderById(req.params.id);
  if (!existing) return res.status(404).json({ error: "ไม่พบคำสั่งซื้อ" });

  // เจ้าของออเดอร์เท่านั้นที่ยกเลิกเองได้ — staff มีเครื่องมือของตัวเองอยู่แล้ว
  // (PATCH /:id/status, PATCH /:id/advance, DELETE /:id)
  // เทียบแบบ coerce เป็น string กันปัญหา type ไม่ตรงกัน (เช่น req.user.id เป็น
  // string จาก JWT payload แต่ existing.userId เป็น number จากข้อมูลออเดอร์)
  if (String(existing.userId) !== String(req.user.id)) {
    return res.status(403).json({ error: "ไม่มีสิทธิ์ยกเลิกคำสั่งซื้อนี้" });
  }

  if (existing.cancelled) {
    return res.status(400).json({ error: "คำสั่งซื้อนี้ถูกยกเลิกไปแล้ว" });
  }

  if ((existing.statusStep ?? 0) >= 2) {
    return res.status(400).json({ error: "คำสั่งซื้อนี้อยู่ระหว่างจัดส่งแล้ว ไม่สามารถยกเลิกได้" });
  }

  const order = orderModel.updateOrder(req.params.id, {
    cancelled: true,
    status: "cancelled",
    statusLabel: "ยกเลิกแล้ว",
  });

  res.json({ order });
}

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  updateStatus,
  advance,
  cancelOrder,
};