// controllers/supportController.js
const supportModel = require("../models/supportModel");

const VALID_STATUSES = ["open", "resolved"];

/** GET /api/support (admin only) - ตั๋วช่วยเหลือทั้งหมด รองรับ query: status */
function getTickets(req, res) {
  let tickets = supportModel.getTickets();
  const { status } = req.query;
  if (status) {
    tickets = tickets.filter((t) => t.status === status);
  }
  res.json({ tickets, total: tickets.length });
}

/** GET /api/support/mine (ผู้ใช้ที่ login) - ตั๋วของตัวเอง */
function getMyTickets(req, res) {
  const tickets = supportModel.getTickets().filter((t) => t.userId === req.user.id);
  res.json({ tickets, total: tickets.length });
}

/** GET /api/support/:id */
function getTicketById(req, res) {
  const ticket = supportModel.getTicketById(req.params.id);
  if (!ticket) return res.status(404).json({ error: "ไม่พบตั๋วนี้" });

  const isStaff = req.user.role === "ADMIN";
  if (!isStaff && ticket.userId !== req.user.id) {
    return res.status(403).json({ error: "ไม่มีสิทธิ์เข้าถึงตั๋วนี้" });
  }
  res.json({ ticket });
}

/** POST /api/support (ผู้ใช้ที่ login แล้ว) - ส่งคำถามถึงทีมกลาง */
function createTicket(req, res) {
  const { subject, message } = req.body || {};
  if (!subject) return res.status(400).json({ error: "กรุณากรอกหัวข้อ" });
  if (!message) return res.status(400).json({ error: "กรุณากรอกรายละเอียด" });

  const ticket = supportModel.createTicket({
    userId: req.user.id,
    role: req.user.role,
    subject,
    message,
  });
  res.status(201).json({ ticket });
}

/** PUT /api/support/:id (admin only) - แก้ไขตั๋วแบบทั่วไป (subject/message/status) */
function updateTicket(req, res) {
  const existing = supportModel.getTicketById(req.params.id);
  if (!existing) return res.status(404).json({ error: "ไม่พบตั๋วนี้" });

  const patch = { ...req.body };
  if (patch.status && !VALID_STATUSES.includes(patch.status)) {
    return res.status(400).json({ error: `status ต้องเป็นหนึ่งใน ${VALID_STATUSES.join(", ")}` });
  }

  const ticket = supportModel.updateTicket(req.params.id, patch);
  res.json({ ticket });
}

/** DELETE /api/support/:id (admin only) */
function deleteTicket(req, res) {
  const existing = supportModel.getTicketById(req.params.id);
  if (!existing) return res.status(404).json({ error: "ไม่พบตั๋วนี้" });

  const tickets = supportModel.deleteTicket(req.params.id);
  res.json({ tickets, message: "ลบตั๋วเรียบร้อยแล้ว" });
}

module.exports = { getTickets, getMyTickets, getTicketById, createTicket, updateTicket, deleteTicket };
