const express = require("express");
const router = express.Router();
const userModel = require("../models/userModel");
const { requireRole } = require("../middleware/auth");

function toSafeUser(user) {
  const { password, ...safe } = user;
  return safe;
}

// GET /api/users  (admin only) - รายชื่อผู้ใช้ทั้งหมด
router.get("/", requireRole("ADMIN"), (req, res) => {
  res.json({ users: userModel.getUsers().map(toSafeUser) });
});

// GET /api/users/:id
router.get("/:id", requireRole("ADMIN"), (req, res) => {
  const user = userModel.getUserById(req.params.id);
  if (!user) return res.status(404).json({ error: "ไม่พบผู้ใช้งาน" });
  res.json({ user: toSafeUser(user) });
});

// POST /api/users  (admin only) - สร้างผู้ใช้ใหม่ (เช่นพนักงาน)
router.post("/", requireRole("ADMIN"), (req, res) => {
  const { name, email, phone, role, status, avatar, password } = req.body || {};
  if (!name || !email || !role) {
    return res.status(400).json({ error: "กรุณากรอกชื่อ อีเมล และบทบาทให้ครบถ้วน" });
  }
  if (userModel.findUserByEmail(email)) {
    return res.status(409).json({ error: "อีเมลนี้ถูกใช้งานแล้ว" });
  }
  const user = userModel.addUser({ name, email, phone, role, status: status || "active", avatar, password });
  res.status(201).json({ user: toSafeUser(user) });
});

// PATCH /api/users/:id/status  (admin only) - active / suspended
router.patch("/:id/status", requireRole("ADMIN"), (req, res) => {
  const { status } = req.body || {};
  if (!["active", "suspended"].includes(status)) {
    return res.status(400).json({ error: "status ต้องเป็น active หรือ suspended" });
  }
  const user = userModel.updateUserStatus(req.params.id, status);
  if (!user) return res.status(404).json({ error: "ไม่พบผู้ใช้งาน" });
  res.json({ user: toSafeUser(user) });
});

// PATCH /api/users/:id  (admin only) - แก้ไขข้อมูลทั่วไป
router.patch("/:id", requireRole("ADMIN"), (req, res) => {
  const patch = { ...req.body };
  delete patch.id;
  delete patch.password; // เปลี่ยนรหัสผ่านต้องทำผ่าน endpoint แยกในอนาคต
  const user = userModel.updateUser(req.params.id, patch);
  if (!user) return res.status(404).json({ error: "ไม่พบผู้ใช้งาน" });
  res.json({ user: toSafeUser(user) });
});

// DELETE /api/users/:id  (admin only)
router.delete("/:id", requireRole("ADMIN"), (req, res) => {
  const users = userModel.deleteUser(req.params.id);
  res.json({ users: users.map(toSafeUser) });
});

module.exports = router;
