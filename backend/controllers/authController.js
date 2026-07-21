// controllers/authController.js
const userModel = require("../models/userModel");
const { createToken, destroyToken } = require("../middleware/auth");
const {
  createResetToken,
  verifyResetToken,
  consumeResetToken,
} = require("../utils/resetTokenStore");

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

function toSafeUser(user) {
  const { password, ...safe } = user;
  return safe;
}

function register(req, res) {
  const { name, email, phone, password } = req.body || {};
  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: "กรุณากรอกชื่อ" });
  }
  if (!email || !String(email).trim()) {
    return res.status(400).json({ error: "กรุณากรอกอีเมล" });
  }
  if (!password || String(password).length < 6) {
    return res.status(400).json({ error: "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร" });
  }

  try {
    const user = userModel.registerUser({ name, email, phone, password });
    const token = createToken(user.id);
    return res.status(201).json({ success: true, user: toSafeUser(user), token });
  } catch (err) {
    return res.status(400).json({ error: err.message || "ไม่สามารถสมัครสมาชิกได้" });
  }
}

function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !String(email).trim() || !password) {
    return res.status(400).json({ error: "กรุณากรอกอีเมลและรหัสผ่าน" });
  }

  try {
    const user = userModel.authenticate(email, password);
    const token = createToken(user.id);
    return res.json({ success: true, user: toSafeUser(user), token });
  } catch (err) {
    const message = err.message || "ไม่สามารถเข้าสู่ระบบได้";
    const status = message.includes("ระงับ") ? 403 : 400;
    return res.status(status).json({ error: message });
  }
}

function logout(req, res) {
  const token = req.token;
  if (token) {
    destroyToken(token);
  }
  return res.json({ success: true, message: "ออกจากระบบเรียบร้อยแล้ว" });
}

function me(req, res) {
  return res.json({ user: req.user });
}

function updateMe(req, res) {
  const updates = {};
  const { name, phone, avatar, password, notifyPreferences } = req.body || {};

  if (name !== undefined) {
    if (!String(name).trim()) {
      return res.status(400).json({ error: "ชื่อไม่สามารถเว้นว่างได้" });
    }
    updates.name = String(name).trim();
  }
  if (phone !== undefined) {
    updates.phone = String(phone).trim();
  }
  if (avatar !== undefined) {
    updates.avatar = String(avatar).trim();
  }
  if (password !== undefined) {
    if (!String(password) || String(password).length < 6) {
      return res.status(400).json({ error: "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร" });
    }
    updates.password = password;
  }
  if (notifyPreferences !== undefined) {
    if (
      typeof notifyPreferences !== "object" ||
      notifyPreferences === null ||
      Array.isArray(notifyPreferences)
    ) {
      return res.status(400).json({ error: "รูปแบบการตั้งค่าแจ้งเตือนไม่ถูกต้อง" });
    }
    // merge กับของเดิมที่เคยบันทึกไว้ (ถ้ามี) แทนที่จะ overwrite ทั้งก้อน
    // เผื่อ frontend ส่งมาแค่บาง field ในอนาคต
    const existing = userModel.getUserById(req.user.id);
    updates.notifyPreferences = { ...(existing?.notifyPreferences || {}), ...notifyPreferences };
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "ไม่พบข้อมูลที่จะอัปเดต" });
  }

  const user = userModel.updateUser(req.user.id, updates);
  if (!user) {
    return res.status(404).json({ error: "ไม่พบผู้ใช้งาน" });
  }

  return res.json({ success: true, user: toSafeUser(user) });
}

/** POST /api/auth/forgot-password */
function forgotPassword(req, res) {
  const { email } = req.body || {};
  if (!email || !String(email).trim()) {
    return res.status(400).json({ error: "กรุณากรอกอีเมล" });
  }

  const user = userModel.findUserByEmail(email);

  // สำคัญ: ไม่บอกว่าอีเมลนี้มีอยู่จริงหรือไม่ ป้องกันการสุ่มเช็คอีเมลในระบบ
  if (user) {
    const token = createResetToken(user.id);
    const resetLink = `${CLIENT_URL}/reset-password?token=${token}`;
    // TODO: ต่อ nodemailer/SMTP จริงในอนาคต ตอนนี้ log ไว้ดูแทนการส่งอีเมล
    console.log(`[password-reset] ${user.email} -> ${resetLink}`);
  }

  res.json({
    success: true,
    message: "หากอีเมลนี้มีอยู่ในระบบ เราได้ส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปให้แล้ว",
  });
}

/** POST /api/auth/reset-password */
function resetPassword(req, res) {
  const { token, password, confirmPassword } = req.body || {};

  if (!token) {
    return res.status(400).json({ error: "ลิงก์ไม่ถูกต้อง กรุณาขอลิงก์รีเซ็ตรหัสผ่านใหม่" });
  }
  if (!password || String(password).length < 6) {
    return res.status(400).json({ error: "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร" });
  }
  if (confirmPassword !== undefined && password !== confirmPassword) {
    return res.status(400).json({ error: "รหัสผ่านยืนยันไม่ตรงกัน" });
  }

  const userId = verifyResetToken(token);
  if (!userId) {
    return res.status(400).json({ error: "ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว" });
  }

  const user = userModel.updateUser(userId, { password });
  consumeResetToken(token); // ใช้ได้ครั้งเดียว

  if (!user) {
    return res.status(404).json({ error: "ไม่พบผู้ใช้งาน" });
  }

  res.json({ success: true, message: "ตั้งรหัสผ่านใหม่เรียบร้อยแล้ว กรุณาเข้าสู่ระบบอีกครั้ง" });
}

module.exports = {
  register,
  login,
  logout,
  me,
  updateMe,
  forgotPassword,
  resetPassword,
};