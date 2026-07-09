const express = require("express");
const router = express.Router();
const supportModel = require("../models/supportModel");
const { requireAuth, requireRole } = require("../middleware/auth");

// GET /api/support  (admin only) - ตั๋วช่วยเหลือทั้งหมด (จาก employee/admin)
router.get("/", requireRole("ADMIN"), (req, res) => {
  res.json({ tickets: supportModel.getTickets() });
});

// GET /api/support/mine  (ผู้ใช้ที่ login) - ตั๋วของตัวเอง
router.get("/mine", requireAuth, (req, res) => {
  const tickets = supportModel.getTickets().filter((t) => t.userId === req.user.id);
  res.json({ tickets });
});

// POST /api/support  (employee/admin ส่งคำถามถึงทีมกลาง)
router.post("/", requireAuth, (req, res) => {
  const { subject, message } = req.body || {};
  if (!subject) return res.status(400).json({ error: "กรุณากรอกหัวข้อ" });
  const ticket = supportModel.createTicket({
    userId: req.user.id,
    role: req.user.role,
    subject,
    message,
  });
  res.status(201).json({ ticket });
});

// PATCH /api/support/:id/status  (admin only) - open / resolved
router.patch("/:id/status", requireRole("ADMIN"), (req, res) => {
  const { status } = req.body || {};
  if (!["open", "resolved"].includes(status)) {
    return res.status(400).json({ error: "status ต้องเป็น open หรือ resolved" });
  }
  const ticket = supportModel.updateTicketStatus(req.params.id, status);
  if (!ticket) return res.status(404).json({ error: "ไม่พบตั๋วนี้" });
  res.json({ ticket });
});

module.exports = router;
