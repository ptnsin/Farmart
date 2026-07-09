// routes/promotions.js
const express = require("express");
const router = express.Router();
const promotionController = require("../controllers/promotionController");
const { requireRole } = require("../middleware/auth");

// GET /api/promotions - public (เพื่อให้หน้า checkout/cart ใช้ตรวจโค้ดส่วนลดได้)
router.get("/", promotionController.getPromotions);

// GET /api/promotions/check/:code - public
router.get("/check/:code", promotionController.checkCode);

// POST /api/promotions (admin only)
router.post("/", requireRole("ADMIN"), promotionController.createPromotion);

// PUT /api/promotions/:id (admin only)
router.put("/:id", requireRole("ADMIN"), promotionController.updatePromotion);

// PATCH /api/promotions/:id/toggle (admin only) - เปิด/ปิดการใช้งาน
router.patch("/:id/toggle", requireRole("ADMIN"), promotionController.toggleStatus);

// DELETE /api/promotions/:id (admin only)
router.delete("/:id", requireRole("ADMIN"), promotionController.deletePromotion);

module.exports = router;
