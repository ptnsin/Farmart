// controllers/promotionController.js
const promotionModel = require("../models/promotionModel");

const VALID_TYPES = ["percent", "fixed"];
const VALID_STATUSES = ["active", "scheduled", "expired"];

/** GET /api/promotions (public - เพื่อให้หน้า checkout/cart ใช้ตรวจโค้ดส่วนลดได้) */
function getPromotions(req, res) {
  const { status } = req.query;
  let promotions = promotionModel.getPromotions();
  if (status) {
    promotions = promotions.filter((p) => p.status === status);
  }
  res.json({ promotions, total: promotions.length });
}

/** GET /api/promotions/check/:code (public) - ตรวจสอบโค้ดส่วนลดตอน checkout */
function checkCode(req, res) {
  const promo = promotionModel.findByCode(req.params.code);
  if (!promo || promo.status !== "active") {
    return res.status(404).json({ error: "โค้ดส่วนลดไม่ถูกต้องหรือหมดอายุแล้ว" });
  }
  res.json({ promotion: promo });
}

/** POST /api/promotions (admin only) */
function createPromotion(req, res) {
  const { description, type, value } = req.body || {};
  if (!description) {
    return res.status(400).json({ error: "กรุณากรอกรายละเอียดโปรโมชั่น" });
  }
  if (type && !VALID_TYPES.includes(type)) {
    return res.status(400).json({ error: `type ต้องเป็นหนึ่งใน ${VALID_TYPES.join(", ")}` });
  }
  if (value === undefined || Number.isNaN(Number(value)) || Number(value) <= 0) {
    return res.status(400).json({ error: "กรุณากรอกมูลค่าส่วนลดให้ถูกต้อง" });
  }

  const promo = promotionModel.addPromotion(req.body);
  res.status(201).json({ promotion: promo });
}

/** PUT /api/promotions/:id (admin only) */
function updatePromotion(req, res) {
  const existing = promotionModel.getPromotionById(req.params.id);
  if (!existing) return res.status(404).json({ error: "ไม่พบโปรโมชั่นนี้" });

  const patch = { ...req.body };
  if (patch.type && !VALID_TYPES.includes(patch.type)) {
    return res.status(400).json({ error: `type ต้องเป็นหนึ่งใน ${VALID_TYPES.join(", ")}` });
  }
  if (patch.status && !VALID_STATUSES.includes(patch.status)) {
    return res.status(400).json({ error: `status ต้องเป็นหนึ่งใน ${VALID_STATUSES.join(", ")}` });
  }

  const promo = promotionModel.updatePromotion(req.params.id, patch);
  res.json({ promotion: promo });
}

/** PATCH /api/promotions/:id/toggle (admin only) - เปิด/ปิดการใช้งาน */
function toggleStatus(req, res) {
  const promo = promotionModel.togglePromotionStatus(req.params.id);
  if (!promo) return res.status(404).json({ error: "ไม่พบโปรโมชั่นนี้" });
  res.json({ promotion: promo });
}

/** DELETE /api/promotions/:id (admin only) */
function deletePromotion(req, res) {
  const existing = promotionModel.getPromotionById(req.params.id);
  if (!existing) return res.status(404).json({ error: "ไม่พบโปรโมชั่นนี้" });

  const promotions = promotionModel.deletePromotion(req.params.id);
  res.json({ promotions, message: "ลบโปรโมชั่นเรียบร้อยแล้ว" });
}

module.exports = { getPromotions, checkCode, createPromotion, updatePromotion, toggleStatus, deletePromotion };
