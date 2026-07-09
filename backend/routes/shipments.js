// routes/shipments.js
const express = require("express");
const router = express.Router();
const shipmentController = require("../controllers/shipmentController");
const { requireRole } = require("../middleware/auth");

// GET /api/shipments (employee/admin)
router.get("/", requireRole("EMPLOYEE", "ADMIN"), shipmentController.getShipments);

// GET /api/shipments/:id (employee/admin)
router.get("/:id", requireRole("EMPLOYEE", "ADMIN"), shipmentController.getShipmentById);

// POST /api/shipments (employee/admin) - สร้างการจัดส่งใหม่ให้ order
router.post("/", requireRole("EMPLOYEE", "ADMIN"), shipmentController.createShipment);

// PUT /api/shipments/:id (employee/admin) - แก้ไขข้อมูลการจัดส่งแบบทั่วไป
router.put("/:id", requireRole("EMPLOYEE", "ADMIN"), shipmentController.updateShipment);

// DELETE /api/shipments/:id (employee/admin)
router.delete("/:id", requireRole("EMPLOYEE", "ADMIN"), shipmentController.deleteShipment);

// PATCH /api/shipments/:id/advance (employee/admin) - preparing -> in_transit -> delivered
router.patch("/:id/advance", requireRole("EMPLOYEE", "ADMIN"), shipmentController.advance);

module.exports = router;
