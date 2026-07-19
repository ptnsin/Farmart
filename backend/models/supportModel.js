// models/supportModel.js
const db = require("../utils/db");
const SEED = require("../data/support.json");

// ประเภทปัญหา/ความสำคัญเริ่มต้น สำหรับตั๋วเก่าที่ยังไม่มี field เหล่านี้ในไฟล์ข้อมูล
const DEFAULT_TYPE = "system";
const DEFAULT_PRIORITY = "medium";

function getTickets() {
  return db.read("support", SEED).map((t) => ({
    type: DEFAULT_TYPE,
    priority: DEFAULT_PRIORITY,
    relatedRef: "",
    ...t,
  }));
}

function saveTickets(tickets) {
  return db.write("support", tickets);
}

function createTicket({ userId, role, subject, message, type, priority, relatedRef }) {
  const tickets = getTickets();
  const nums = tickets.map((t) => Number(String(t.id).replace(/\D/g, ""))).filter((n) => !Number.isNaN(n));
  const nextNum = (nums.length ? Math.max(...nums) : 1040) + 1;
  const ticket = {
    id: `SP-${nextNum}`,
    userId: userId || null,
    role: role || "CUSTOMER",
    subject: subject || "",
    message: message || "",
    type: type || DEFAULT_TYPE, // "delivery" | "stock" | "system"
    priority: priority || DEFAULT_PRIORITY, // "high" | "medium" | "low"
    relatedRef: relatedRef || "", // เช่น เลขออเดอร์ #ORD-2023-001 หรือ SKU
    status: "open",
    date: new Date().toISOString().slice(0, 10),
  };
  saveTickets([ticket, ...tickets]);
  return ticket;
}

function updateTicketStatus(id, status) {
  const tickets = getTickets().map((t) => (t.id === id ? { ...t, status } : t));
  saveTickets(tickets);
  return tickets.find((t) => t.id === id) || null;
}

function getTicketById(id) {
  return getTickets().find((t) => t.id === id) || null;
}

/** แก้ไขตั๋วแบบทั่วไป (ใช้กับ PUT /api/support/:id) */
function updateTicket(id, patch) {
  const safePatch = { ...patch };
  delete safePatch.id;
  const tickets = getTickets().map((t) => (t.id === id ? { ...t, ...safePatch, id: t.id } : t));
  saveTickets(tickets);
  return tickets.find((t) => t.id === id) || null;
}

/** ลบตั๋ว */
function deleteTicket(id) {
  const tickets = getTickets().filter((t) => t.id !== id);
  saveTickets(tickets);
  return tickets;
}

module.exports = {
  getTickets,
  saveTickets,
  createTicket,
  updateTicketStatus,
  getTicketById,
  updateTicket,
  deleteTicket,
};