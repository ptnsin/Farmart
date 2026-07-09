// routes/dashboard.js
const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const { requireRole } = require("../middleware/auth");

// GET /api/dashboard (employee/admin) - สรุปข้อมูลภาพรวมของระบบ
router.get("/", requireRole("EMPLOYEE", "ADMIN"), dashboardController.getDashboard);

module.exports = router;
