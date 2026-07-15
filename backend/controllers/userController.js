// controllers/userController.js
const userModel = require("../models/userModel");

const VALID_ROLES = ["ADMIN", "EMPLOYEE", "CUSTOMER"];
const VALID_STATUSES = ["active", "suspended"];

function toSafeUser(user) {
  const { password, ...safe } = user;
  return safe;
}

/** GET /api/users (admin only) - รายชื่อผู้ใช้ทั้งหมด รองรับ query: role, status, search */
function getUsers(req, res) {
  let users = userModel.getUsers();
  const { role, status, search } = req.query;

  if (role) {
    users = users.filter((u) => u.role === role);
  }
  if (status) {
    users = users.filter((u) => u.status === status);
  }
  if (search) {
    const q = String(search).toLowerCase();
    users = users.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }

  res.json({ users: users.map(toSafeUser), total: users.length });
}

/** GET /api/users/:id */
function getUserById(req, res) {
  const user = userModel.getUserById(req.params.id);
  if (!user) return res.status(404).json({ error: "ไม่พบผู้ใช้งาน" });
  res.json({ user: toSafeUser(user) });
}

/** POST /api/users (admin only) - สร้างผู้ใช้ใหม่ (เช่นพนักงาน) */
function createUser(req, res) {
  const { name, email, phone, role, status, avatar, password } = req.body || {};

  if (!name || !email || !role) {
    return res.status(400).json({ error: "กรุณากรอกชื่อ อีเมล และบทบาทให้ครบถ้วน" });
  }
  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({ error: `role ต้องเป็นหนึ่งใน ${VALID_ROLES.join(", ")}` });
  }
  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status ต้องเป็นหนึ่งใน ${VALID_STATUSES.join(", ")}` });
  }
  if (userModel.findUserByEmail(email)) {
    return res.status(409).json({ error: "อีเมลนี้ถูกใช้งานแล้ว" });
  }

  const user = userModel.addUser({
    name,
    email,
    phone,
    role,
    status: status || "active",
    avatar,
    password,
  });
  res.status(201).json({ user: toSafeUser(user) });
}

/** PUT /api/users/:id (admin only) - แก้ไขข้อมูลผู้ใช้ (รวมถึง status, role) */
function updateUser(req, res) {
  const existing = userModel.getUserById(req.params.id);
  if (!existing) return res.status(404).json({ error: "ไม่พบผู้ใช้งาน" });

  const patch = { ...req.body };
  delete patch.id;
  delete patch.password; // เปลี่ยนรหัสผ่านต้องทำผ่าน endpoint แยกในอนาคต
  delete patch.createdAt;

  if (patch.role && !VALID_ROLES.includes(patch.role)) {
    return res.status(400).json({ error: `role ต้องเป็นหนึ่งใน ${VALID_ROLES.join(", ")}` });
  }
  if (patch.status && !VALID_STATUSES.includes(patch.status)) {
    return res.status(400).json({ error: `status ต้องเป็นหนึ่งใน ${VALID_STATUSES.join(", ")}` });
  }
  if (patch.email) {
    const dup = userModel.findUserByEmail(patch.email);
    if (dup && dup.id !== existing.id) {
      return res.status(409).json({ error: "อีเมลนี้ถูกใช้งานแล้ว" });
    }
  }

  const user = userModel.updateUser(req.params.id, patch);
  res.json({ user: toSafeUser(user) });
}

/** DELETE /api/users/:id (admin only) */
function deleteUser(req, res) {
  const existing = userModel.getUserById(req.params.id);
  if (!existing) return res.status(404).json({ error: "ไม่พบผู้ใช้งาน" });

  if (req.user && existing.id === req.user.id) {
    return res.status(403).json({ error: "ไม่สามารถลบบัญชีของตัวเองได้" });
  }
  if (existing.role === "ADMIN") {
    return res.status(403).json({ error: "ไม่สามารถลบบัญชี Admin ด้วยกันเองได้" });
  }

  const users = userModel.deleteUser(req.params.id);
  res.json({ users: users.map(toSafeUser), message: "ลบผู้ใช้งานเรียบร้อยแล้ว" });
}

module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser };