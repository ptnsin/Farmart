const express = require("express");
const router = express.Router();
const productModel = require("../models/productModel");
const { requireRole, requireAuth } = require("../middleware/auth");

// GET /api/products - รายการสินค้าทั้งหมด (public) รองรับ query: category, search
router.get("/", (req, res) => {
  let products = productModel.getProducts();
  const { category, search } = req.query;
  if (category) {
    products = products.filter((p) => p.category === category);
  }
  if (search) {
    const q = String(search).toLowerCase();
    products = products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    );
  }
  res.json({ products });
});

// GET /api/products/:id
router.get("/:id", (req, res) => {
  const product = productModel.getProductById(req.params.id);
  if (!product) return res.status(404).json({ error: "ไม่พบสินค้า" });
  res.json({ product });
});

// POST /api/products  (employee/admin) - เพิ่มสินค้าใหม่ (เข้าสถานะ pending รออนุมัติ)
router.post("/", requireRole("EMPLOYEE", "ADMIN"), (req, res) => {
  const product = productModel.addProduct({
    ...req.body,
    approvalStatus: req.user.role === "ADMIN" ? "approved" : "pending",
  });
  res.status(201).json({ product });
});

// PUT /api/products/:id  (employee/admin) - แก้ไขสินค้า
router.put("/:id", requireRole("EMPLOYEE", "ADMIN"), (req, res) => {
  const product = productModel.updateProduct(req.params.id, req.body);
  if (!product) return res.status(404).json({ error: "ไม่พบสินค้า" });
  res.json({ product });
});

// DELETE /api/products/:id  (employee/admin)
router.delete("/:id", requireRole("EMPLOYEE", "ADMIN"), (req, res) => {
  const products = productModel.deleteProduct(req.params.id);
  res.json({ products });
});

// PATCH /api/products/:id/approval  (admin only) - อนุมัติ/ปฏิเสธสินค้าที่พนักงานเพิ่ม
router.patch("/:id/approval", requireRole("ADMIN"), (req, res) => {
  const { approvalStatus } = req.body || {};
  if (!["approved", "rejected", "pending"].includes(approvalStatus)) {
    return res.status(400).json({ error: "approvalStatus ไม่ถูกต้อง" });
  }
  const product = productModel.updateProduct(req.params.id, { approvalStatus });
  if (!product) return res.status(404).json({ error: "ไม่พบสินค้า" });
  res.json({ product });
});

// POST /api/products/:id/reviews  (ลูกค้าที่ login แล้ว) - เพิ่มรีวิวสินค้า
router.post("/:id/reviews", requireAuth, (req, res) => {
  const { rating, comment } = req.body || {};
  const product = productModel.addReview(req.params.id, {
    customer: req.user.name,
    rating,
    comment,
  });
  if (!product) return res.status(404).json({ error: "ไม่พบสินค้า" });
  res.status(201).json({ product });
});

// POST /api/products/:id/reviews/:reviewId/reply  (employee/admin) - ร้านตอบกลับรีวิว
router.post("/:id/reviews/:reviewId/reply", requireRole("EMPLOYEE", "ADMIN"), (req, res) => {
  const { reply } = req.body || {};
  const product = productModel.replyToReview(req.params.id, req.params.reviewId, reply || "");
  if (!product) return res.status(404).json({ error: "ไม่พบสินค้า" });
  res.json({ product });
});

module.exports = router;
