// controllers/authController.js
const userModel = require("../models/userModel");
const { createToken, destroyToken } = require("../middleware/auth");

function toSafeUser(user) {
  const { password, ...safe } = user;
  return safe;
}

/** POST /api/auth/register - สมัครสมาชิกได้เฉพาะ CUSTOMER */
function register(req, res) {
  const { name, email, phone, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({
      error: "กรุณากรอกชื่อ อีเมล และรหัสผ่านให้ครบถ้วน",
    });
  }

  if (String(password).length < 6) {
    return res.status(400).json({ error: "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร" });
  }

  try {
    const user = userModel.registerUser({ name, email, phone, password });
    const token = createToken(user.id);
    res.status(201).json({ token, user: toSafeUser(user) });
  } catch (err) {
    res.status(409).json({ error: err.message });
  }
}

/** POST /api/auth/login - เข้าสู่ระบบได้ทุก Role */
function login(req, res) {
  const { email, password, keepSignedIn } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "กรุณากรอกอีเมลและรหัสผ่าน" });
  }
  try {
    const user = userModel.authenticate(email, password);
    if (!user) {
      return res.status(401).json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }
    const token = createToken(user.id);
    res.json({ token, user: toSafeUser(user), keepSignedIn: !!keepSignedIn });
  } catch (err) {
    // บัญชีถูกระงับ
    res.status(403).json({ error: err.message });
  }
}

/** POST /api/auth/logout */
function logout(req, res) {
  destroyToken(req.token);
  res.json({ success: true, message: "ออกจากระบบเรียบร้อยแล้ว" });
}

/** GET /api/auth/me */
function me(req, res) {
  res.json({ user: req.user });
}

/**
 * PUT /api/auth/me - แก้ไขข้อมูลโปรไฟล์ของ "ตัวเอง" เท่านั้น
 * ใช้ req.user.id จาก token เสมอ ไม่รับ id จากภายนอก กัน user แก้ไขบัญชีคนอื่น
 * ทุก role (ADMIN/EMPLOYEE/CUSTOMER) เรียกได้ เพราะแก้ได้แค่ของตัวเอง ไม่กระทบคนอื่น
 */
function updateMe(req, res) {
  const patch = { ...req.body };

  // ป้องกันการยกระดับสิทธิ์ตัวเอง หรือแก้ field ที่ไม่ควรแก้ผ่าน endpoint นี้
  // (เปลี่ยน role/status ต้องให้ ADMIN ทำผ่าน PUT /api/users/:id เท่านั้น)
  delete patch.id;
  delete patch.role;
  delete patch.status;
  delete patch.createdAt;
  delete patch.confirmPassword;

  if (patch.name !== undefined && !String(patch.name).trim()) {
    return res.status(400).json({ error: "กรุณากรอกชื่อ-นามสกุล" });
  }

  if (patch.email !== undefined) {
    if (!String(patch.email).trim()) {
      return res.status(400).json({ error: "กรุณากรอกอีเมล" });
    }
    const dup = userModel.findUserByEmail(patch.email);
    if (dup && dup.id !== req.user.id) {
      return res.status(409).json({ error: "อีเมลนี้ถูกใช้งานแล้ว" });
    }
  }

  if (patch.password) {
    if (String(patch.password).length < 6) {
      return res.status(400).json({ error: "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร" });
    }
  } else {
    delete patch.password; // ไม่ส่งมา หรือส่งค่าว่างมา = ไม่เปลี่ยนรหัสผ่าน
  }

  const user = userModel.updateUser(req.user.id, patch);
  if (!user) return res.status(404).json({ error: "ไม่พบผู้ใช้งาน" });

  res.json({ user: toSafeUser(user) });
}

module.exports = { register, login, logout, me, updateMe };