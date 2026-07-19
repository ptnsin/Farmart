// routes/reports.js
const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const { requireRole } = require("../middleware/auth");

// GET /api/reports/dashboard (employee/admin)
router.get("/dashboard", requireRole("EMPLOYEE", "ADMIN"), reportController.getDashboardReport);

// GET /api/reports/dashboard-summary (employee/admin) - สรุปสำหรับหน้า AdminReports (stats, ยอดขายรายเดือน, สินค้าขายดี)
router.get(
  "/dashboard-summary",
  requireRole("EMPLOYEE", "ADMIN"),
  reportController.getDashboardSummary
);

// GET /api/reports/sales (employee/admin) รองรับ query: from, to
router.get("/sales", requireRole("EMPLOYEE", "ADMIN"), reportController.getSalesReport);

// GET /api/reports/inventory (employee/admin)
router.get("/inventory", requireRole("EMPLOYEE", "ADMIN"), reportController.getInventoryReport);

module.exports = router;