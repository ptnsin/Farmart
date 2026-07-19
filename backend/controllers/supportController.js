// controllers/supportController.js
const supportModel = require("../models/supportModel");
const userModel = require("../models/userModel");

const VALID_STATUSES = ["open", "resolved"];
const VALID_TYPES = ["delivery", "stock", "system"];
const VALID_PRIORITIES = ["high", "medium", "low"];

/** แนบข้อมูลผู้แจ้ง (ชื่อ) เข้ากับตั๋ว โดยดึงจาก userModel ด้วย userId */
function attachReporter(ticket) {
  const user = ticket.userId ? userModel.getUserById(ticket.userId) : null;
  return {
    ...ticket,
    reportedBy: user ? { id: user.id, name: user.name, role: ticket.role } : null,
  };
}

/**
 * GET /api/support (admin only) - ตั๋วช่วยเหลือทั้งหมด
 * รองรับ query: status, type, priority, role (EMPLOYEE/CUSTOMER/ADMIN)
 * ใช้ ?role=EMPLOYEE เพื่อดึง "ปัญหาที่พนักงานแจ้งเข้ามา" สำหรับหน้า dashboard
 */
function getTickets(req, res) {
  let tickets = supportModel.getTickets();
  const { status, type, priority, role } = req.query;
  if (status) tickets = tickets.filter((t) => t.status === status);
  if (type) tickets = tickets.filter((t) => t.type === type);
  if (priority) tickets = tickets.filter((t) => t.priority === priority);
  if (role) tickets = tickets.filter((t) => t.role === role);

  tickets = tickets.map(attachReporter);
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
  res.json({ ticket: attachReporter(ticket) });
}

/** POST /api/support (ผู้ใช้ที่ login แล้ว) - ส่งคำถามถึงทีมกลาง */
function createTicket(req, res) {
  const { subject, message, type, priority, relatedRef } = req.body || {};
  if (!subject) return res.status(400).json({ error: "กรุณากรอกหัวข้อ" });
  if (!message) return res.status(400).json({ error: "กรุณากรอกรายละเอียด" });
  if (type && !VALID_TYPES.includes(type)) {
    return res.status(400).json({ error: `type ต้องเป็นหนึ่งใน ${VALID_TYPES.join(", ")}` });
  }
  if (priority && !VALID_PRIORITIES.includes(priority)) {
    return res.status(400).json({ error: `priority ต้องเป็นหนึ่งใน ${VALID_PRIORITIES.join(", ")}` });
  }

  const ticket = supportModel.createTicket({
    userId: req.user.id,
    role: req.user.role,
    subject,
    message,
    type,
    priority,
    relatedRef,
  });
  res.status(201).json({ ticket: attachReporter(ticket) });
}

/** PUT /api/support/:id (admin only) - แก้ไขตั๋วแบบทั่วไป (subject/message/status) */
function updateTicket(req, res) {
  const existing = supportModel.getTicketById(req.params.id);
  if (!existing) return res.status(404).json({ error: "ไม่พบตั๋วนี้" });

  const patch = { ...req.body };
  if (patch.status && !VALID_STATUSES.includes(patch.status)) {
    return res.status(400).json({ error: `status ต้องเป็นหนึ่งใน ${VALID_STATUSES.join(", ")}` });
  }
  if (patch.type && !VALID_TYPES.includes(patch.type)) {
    return res.status(400).json({ error: `type ต้องเป็นหนึ่งใน ${VALID_TYPES.join(", ")}` });
  }
  if (patch.priority && !VALID_PRIORITIES.includes(patch.priority)) {
    return res.status(400).json({ error: `priority ต้องเป็นหนึ่งใน ${VALID_PRIORITIES.join(", ")}` });
  }

  const ticket = supportModel.updateTicket(req.params.id, patch);
  res.json({ ticket: attachReporter(ticket) });
}

/** DELETE /api/support/:id (admin only) */
function deleteTicket(req, res) {
  const existing = supportModel.getTicketById(req.params.id);
  if (!existing) return res.status(404).json({ error: "ไม่พบตั๋วนี้" });

  const tickets = supportModel.deleteTicket(req.params.id);
  res.json({ tickets, message: "ลบตั๋วเรียบร้อยแล้ว" });
}

module.exports = {
  getTickets,
  getMyTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
  VALID_STATUSES,
  VALID_TYPES,
  VALID_PRIORITIES,
};