// controllers/shipmentController.js
const shipmentModel = require("../models/shipmentModel");

const VALID_STATUSES = ["preparing", "in_transit", "delivered"];

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
  const shipment = shipmentModel.advanceShipment(req.params.id);
  if (!shipment) {
    return res.status(404).json({ error: "ไม่พบรายการจัดส่งนี้ หรืออยู่ในสถานะสุดท้ายแล้ว" });
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
