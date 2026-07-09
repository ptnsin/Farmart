const express = require("express");
const router = express.Router();
const promotionModel = require("../models/promotionModel");
const { requireRole } = require("../middleware/auth");

// GET /api/promotions (public - เพื่อให้หน้า checkout/cart ใช้ตรวจโค้ดส่วนลดได้)
router.get("/", (req, res) => {
  res.json({ promotions: promotionModel.getPromotions() });
});

// GET /api/promotions/check/:code (public) - ตรวจสอบโค้ดส่วนลดตอน checkout
router.get("/check/:code", (req, res) => {
  const promo = promotionModel.findByCode(req.params.code);
  if (!promo || promo.status !== "active") {
    return res.status(404).json({ error: "โค้ดส่วนลดไม่ถูกต้องหรือหมดอายุแล้ว" });
  }
  res.json({ promotion: promo });
});

// POST /api/promotions  (admin only)
router.post("/", requireRole("ADMIN"), (req, res) => {
  const promo = promotionModel.addPromotion(req.body || {});
  res.status(201).json({ promotion: promo });
});

// PATCH /api/promotions/:id  (admin only)
router.patch("/:id", requireRole("ADMIN"), (req, res) => {
  const promo = promotionModel.updatePromotion(req.params.id, req.body || {});
  if (!promo) return res.status(404).json({ error: "ไม่พบโปรโมชั่นนี้" });
  res.json({ promotion: promo });
});

// PATCH /api/promotions/:id/toggle  (admin only) - เปิด/ปิดการใช้งาน
router.patch("/:id/toggle", requireRole("ADMIN"), (req, res) => {
  const promo = promotionModel.togglePromotionStatus(req.params.id);
  if (!promo) return res.status(404).json({ error: "ไม่พบโปรโมชั่นนี้" });
  res.json({ promotion: promo });
});

// DELETE /api/promotions/:id  (admin only)
router.delete("/:id", requireRole("ADMIN"), (req, res) => {
  const promotions = promotionModel.deletePromotion(req.params.id);
  res.json({ promotions });
});

module.exports = router;
