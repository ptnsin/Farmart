const express = require("express");
const router = express.Router();
const shipmentModel = require("../models/shipmentModel");
const { requireRole } = require("../middleware/auth");

// GET /api/shipments  (employee/admin)
router.get("/", requireRole("EMPLOYEE", "ADMIN"), (req, res) => {
  res.json({ shipments: shipmentModel.getShipments() });
});

// POST /api/shipments  (employee/admin) - สร้างการจัดส่งใหม่ให้ order
router.post("/", requireRole("EMPLOYEE", "ADMIN"), (req, res) => {
  const shipment = shipmentModel.createShipment(req.body || {});
  res.status(201).json({ shipment });
});

// PATCH /api/shipments/:id/advance  (employee/admin) - preparing -> in_transit -> delivered
router.patch("/:id/advance", requireRole("EMPLOYEE", "ADMIN"), (req, res) => {
  const shipment = shipmentModel.advanceShipment(req.params.id);
  if (!shipment) return res.status(404).json({ error: "ไม่พบรายการจัดส่งนี้ หรืออยู่ในสถานะสุดท้ายแล้ว" });
  res.json({ shipment });
});

module.exports = router;
