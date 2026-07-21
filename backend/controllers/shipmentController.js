// controllers/shipmentController.js
const shipmentModel = require("../models/shipmentModel");
const orderModel = require("../models/orderModel");
const notificationModel = require("../models/notificationModel");

const VALID_STATUSES = ["preparing", "in_transit", "delivered"];

// เดิม controller นี้ไม่เคยสร้างแจ้งเตือนเลย ทั้งที่หน้า "การขนส่ง" (EmployeeShipping.jsx) ก็เป็นอีกจุดที่
// พนักงานกดเปลี่ยนสถานะได้เหมือนกับหน้า "คำสั่งซื้อ" — shipmentModel จะ sync สถานะกลับไปที่ order ให้เอง
// อยู่แล้ว แต่ sync แค่ตัวข้อมูล ไม่ได้ยิงแจ้งเตือน ทำให้ลูกค้าไม่รู้ถ้าพนักงานอัปเดตจากหน้านี้แทน
// ใช้ถ้อยคำเดียวกับ STEP_NOTIFY_CONTENT ใน orderController.js เพื่อไม่ให้ข้อความไม่ตรงกันระหว่าง 2 หน้า
const SHIPMENT_STATUS_NOTIFY_CONTENT = {
  preparing: {
    title: (order) => `คำสั่งซื้อ ${order.id} กำลังเตรียมพัสดุ`,
    message: () => "เจ้าหน้าที่กำลังจัดเตรียมสินค้าของคุณ จะแจ้งเตือนอีกครั้งเมื่อเริ่มจัดส่ง",
  },
  in_transit: {
    title: (order) => `คำสั่งซื้อ ${order.id} กำลังจัดส่ง`,
    message: () => "พัสดุของคุณออกเดินทางแล้ว กรุณาเตรียมรับสินค้า",
  },
  delivered: {
    title: (order) => `คำสั่งซื้อ ${order.id} จัดส่งสำเร็จ`,
    message: () => "คำสั่งซื้อของคุณจัดส่งสำเร็จเรียบร้อยแล้ว ขอบคุณที่ใช้บริการ Farmart",
  },
};

/** แจ้งเตือนลูกค้าเจ้าของ order ที่ผูกกับ shipment นี้ (ไม่ทำให้ request หลักล้มเหลวถ้าแจ้งเตือนพัง) */
function notifyOrderForShipment(shipment, content) {
  try {
    if (!content || !shipment?.order) return;
    const order = orderModel.getOrderById(shipment.order);
    if (!order) return;
    notificationModel.addNotification({
      userId: order.userId,
      type: "orderUpdates",
      title: content.title(order),
      message: content.message(order),
    });
  } catch (err) {
    console.error("แจ้งเตือนลูกค้าเรื่องสถานะการจัดส่งไม่สำเร็จ:", err.message);
  }
}

/** GET /api/shipments (employee/admin) รองรับ query: status */
function getShipments(req, res) {
  let shipments = shipmentModel.getShipments();
  const { status } = req.query;
  if (status) {
    shipments = shipments.filter((s) => s.status === status);
  }
  res.json({ shipments, total: shipments.length });
}

/** GET /api/shipments/:id (employee/admin) */
function getShipmentById(req, res) {
  const shipment = shipmentModel.getShipmentById(req.params.id);
  if (!shipment) return res.status(404).json({ error: "ไม่พบรายการจัดส่งนี้" });
  res.json({ shipment });
}

/** PUT /api/shipments/:id (employee/admin) - แก้ไขข้อมูลการจัดส่งแบบทั่วไป */
function updateShipment(req, res) {
  const existing = shipmentModel.getShipmentById(req.params.id);
  if (!existing) return res.status(404).json({ error: "ไม่พบรายการจัดส่งนี้" });

  const patch = { ...req.body };
  if (patch.status && !VALID_STATUSES.includes(patch.status)) {
    return res.status(400).json({ error: `status ต้องเป็นหนึ่งใน ${VALID_STATUSES.join(", ")}` });
  }

  const shipment = shipmentModel.updateShipment(req.params.id, patch);

  // แจ้งเตือนเฉพาะตอนสถานะเปลี่ยนจริง กันแจ้งซ้ำถ้า PUT มาด้วย status เดิม หรือ patch ไม่มี status เลย
  if (patch.status && existing.status !== patch.status) {
    notifyOrderForShipment(shipment, SHIPMENT_STATUS_NOTIFY_CONTENT[patch.status]);
  }

  res.json({ shipment });
}

/** POST /api/shipments (employee/admin) - สร้างการจัดส่งใหม่ให้ order */
function createShipment(req, res) {
  const { order } = req.body || {};
  if (!order) {
    return res.status(400).json({ error: "กรุณาระบุเลขที่คำสั่งซื้อ (order)" });
  }
  const shipment = shipmentModel.createShipment(req.body);
  res.status(201).json({ shipment });
}

/** DELETE /api/shipments/:id (employee/admin) */
function deleteShipment(req, res) {
  const existing = shipmentModel.getShipmentById(req.params.id);
  if (!existing) return res.status(404).json({ error: "ไม่พบรายการจัดส่งนี้" });

  const shipments = shipmentModel.deleteShipment(req.params.id);
  res.json({ shipments, message: "ลบรายการจัดส่งเรียบร้อยแล้ว" });
}

/** PATCH /api/shipments/:id/advance (employee/admin) - preparing -> in_transit -> delivered */
function advance(req, res) {
  const existing = shipmentModel.getShipmentById(req.params.id);
  const shipment = shipmentModel.advanceShipment(req.params.id);
  if (!shipment) {
    return res.status(404).json({ error: "ไม่พบรายการจัดส่งนี้ หรืออยู่ในสถานะสุดท้ายแล้ว" });
  }

  if (!existing || existing.status !== shipment.status) {
    notifyOrderForShipment(shipment, SHIPMENT_STATUS_NOTIFY_CONTENT[shipment.status]);
  }

  res.json({ shipment });
}

module.exports = {
  getShipments,
  getShipmentById,
  updateShipment,
  createShipment,
  deleteShipment,
  advance,
};
