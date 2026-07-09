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

module.exports = { register, login, logout, me };
