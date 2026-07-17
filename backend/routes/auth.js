// routes/auth.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");

// POST /api/auth/register - สมัครสมาชิกได้เฉพาะ CUSTOMER
router.post("/register", authController.register);

// POST /api/auth/login - เข้าสู่ระบบได้ทุก Role
router.post("/login", authController.login);

// POST /api/auth/logout
router.post("/logout", requireAuth, authController.logout);

// GET /api/auth/me
router.get("/me", requireAuth, authController.me);

// PUT /api/auth/me - แก้ไขโปรไฟล์ของตัวเอง (ทุก role ทำได้ แก้ได้แค่ของตัวเอง)
router.put("/me", requireAuth, authController.updateMe);

// routes/auth.js
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

module.exports = router;
