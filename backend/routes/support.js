// routes/support.js
const express = require("express");
const router = express.Router();
const supportController = require("../controllers/supportController");
const { requireAuth, requireRole } = require("../middleware/auth");

// GET /api/support (employee/admin) - ตั๋วช่วยเหลือทั้งหมด (ทั้งที่ลูกค้าและพนักงานแจ้งเข้ามา)
// รองรับ query: status, type, priority, role (filter ว่าเป็นตั๋วจากลูกค้าหรือพนักงาน)
router.get("/", requireRole("EMPLOYEE", "ADMIN"), supportController.getTickets);

// GET /api/support/mine (ผู้ใช้ที่ login) - ตั๋วของตัวเอง
router.get("/mine", requireAuth, supportController.getMyTickets);

// GET /api/support/:id
router.get("/:id", requireAuth, supportController.getTicketById);

// POST /api/support (ผู้ใช้ที่ login แล้ว) - ส่งคำถามถึงทีมกลาง
router.post("/", requireAuth, supportController.createTicket);

// PUT /api/support/:id (admin only) - แก้ไขตั๋ว
router.put("/:id", requireRole("ADMIN"), supportController.updateTicket);

// DELETE /api/support/:id (admin only)
router.delete("/:id", requireRole("ADMIN"), supportController.deleteTicket);

module.exports = router;