// models/supportModel.js
const db = require("../utils/db");
const SEED = require("../data/support.seed.json");

function getTickets() {
  return db.read("support", SEED);
}

function saveTickets(tickets) {
  return db.write("support", tickets);
}

function createTicket({ userId, role, subject, message }) {
  const tickets = getTickets();
  const nums = tickets.map((t) => Number(String(t.id).replace(/\D/g, ""))).filter((n) => !Number.isNaN(n));
  const nextNum = (nums.length ? Math.max(...nums) : 1040) + 1;
  const ticket = {
    id: `SP-${nextNum}`,
    userId: userId || null,
    role: role || "CUSTOMER",
    subject: subject || "",
    message: message || "",
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

module.exports = { getTickets, saveTickets, createTicket, updateTicketStatus };
