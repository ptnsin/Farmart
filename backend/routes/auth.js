const express = require("express");
const router = express.Router();
const userModel = require("../models/userModel");
const { createToken, destroyToken, requireAuth } = require("../middleware/auth");

function toSafeUser(user) {
  const { password, ...safe } = user;
  return safe;
}


// POST /api/auth/register
router.post("/register", (req, res) => {
  const { name, email, phone, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({
      error: "กรุณากรอกชื่อ อีเมล และรหัสผ่านให้ครบถ้วน"
    });
  }

  try {
    const user = userModel.registerUser({
      name,
      email,
      phone,
      password
    });

    const token = createToken(user.id);

    res.status(201).json({
      token,
      user: toSafeUser(user)
    });
  } catch (err) {
    res.status(409).json({
      error: err.message
    });
  }
});

// POST /api/auth/login
router.post("/login", (req, res) => {
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
    // account suspended
    res.status(403).json({ error: err.message });
  }
});

// POST /api/auth/logout
router.post("/logout", requireAuth, (req, res) => {
  destroyToken(req.token);
  res.json({ success: true });
});

// GET /api/auth/me
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
