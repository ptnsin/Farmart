// controllers/productController.js
const productModel = require("../models/productModel");
const categoryModel = require("../models/categoryModel");

/** GET /api/products - รายการสินค้าทั้งหมด (public) รองรับ query: category, search, stockLevel */
function getProducts(req, res) {
  let products = productModel.getProducts();
  const { category, search, stockLevel, approvalStatus } = req.query;

  if (category) {
    products = products.filter((p) => p.category === category);
  }
  if (stockLevel) {
    products = products.filter((p) => p.stockLevel === stockLevel);
  }
  if (approvalStatus) {
    products = products.filter((p) => p.approvalStatus === approvalStatus);
  }
  if (search) {
    const q = String(search).toLowerCase();
    products = products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    );
  }

  res.json({ products, total: products.length });
}

/** GET /api/products/:id */
function getProductById(req, res) {
  const product = productModel.getProductById(req.params.id);
  if (!product) return res.status(404).json({ error: "ไม่พบสินค้า" });
  res.json({ product });
}

/** POST /api/products (employee/admin) - เพิ่มสินค้าใหม่ */
function createProduct(req, res) {
  const { name, category, price } = req.body || {};

  if (!name || !category) {
    return res.status(400).json({ error: "กรุณากรอกชื่อสินค้าและหมวดหมู่ให้ครบถ้วน" });
  }
  if (price === undefined || Number.isNaN(Number(price)) || Number(price) < 0) {
    return res.status(400).json({ error: "กรุณากรอกราคาสินค้าให้ถูกต้อง" });
  }
  if (!categoryModel.findCategoryByName(category)) {
    return res.status(400).json({ error: "ไม่พบหมวดหมู่นี้ในระบบ กรุณาเพิ่มหมวดหมู่ก่อน" });
  }

  const product = productModel.addProduct({
    ...req.body,
    // EMPLOYEE เพิ่มสินค้าใหม่ต้องรออนุมัติจาก ADMIN ก่อน, ADMIN เพิ่มเองอนุมัติทันที
    approvalStatus: req.user.role === "ADMIN" ? "approved" : "pending",
  });
  res.status(201).json({ product });
}

/** PUT /api/products/:id (employee/admin) - แก้ไขสินค้า */
function updateProduct(req, res) {
  const existing = productModel.getProductById(req.params.id);
  if (!existing) return res.status(404).json({ error: "ไม่พบสินค้า" });

  const patch = { ...req.body };
  if (patch.price !== undefined && (Number.isNaN(Number(patch.price)) || Number(patch.price) < 0)) {
    return res.status(400).json({ error: "ราคาสินค้าไม่ถูกต้อง" });
  }
  if (patch.category && !categoryModel.findCategoryByName(patch.category)) {
    return res.status(400).json({ error: "ไม่พบหมวดหมู่นี้ในระบบ" });
  }

  const product = productModel.updateProduct(req.params.id, patch);
  res.json({ product });
}

/** DELETE /api/products/:id (employee/admin) */
function deleteProduct(req, res) {
  const existing = productModel.getProductById(req.params.id);
  if (!existing) return res.status(404).json({ error: "ไม่พบสินค้า" });

  const products = productModel.deleteProduct(req.params.id);
  res.json({ products, message: "ลบสินค้าเรียบร้อยแล้ว" });
}

/** PATCH /api/products/:id/approval (admin only) - อนุมัติ/ปฏิเสธสินค้าที่พนักงานเพิ่ม */
function updateApproval(req, res) {
  const { approvalStatus } = req.body || {};
  if (!["approved", "rejected", "pending"].includes(approvalStatus)) {
    return res.status(400).json({ error: "approvalStatus ไม่ถูกต้อง" });
  }
  const product = productModel.updateProduct(req.params.id, { approvalStatus });
  if (!product) return res.status(404).json({ error: "ไม่พบสินค้า" });
  res.json({ product });
}

/** POST /api/products/:id/reviews (ลูกค้าที่ login แล้ว) - เพิ่มรีวิวสินค้า */
function addReview(req, res) {
  const { rating, comment } = req.body || {};
  if (!rating || Number(rating) < 1 || Number(rating) > 5) {
    return res.status(400).json({ error: "กรุณาให้คะแนน 1-5 ดาว" });
  }
  const product = productModel.addReview(req.params.id, {
    customer: req.user.name,
    rating,
    comment,
  });
  if (!product) return res.status(404).json({ error: "ไม่พบสินค้า" });
  res.status(201).json({ product });
}

/** POST /api/products/:id/reviews/:reviewId/reply (employee/admin) - ร้านตอบกลับรีวิว */
function replyToReview(req, res) {
  const { reply } = req.body || {};
  if (!reply) return res.status(400).json({ error: "กรุณากรอกข้อความตอบกลับ" });

  const product = productModel.replyToReview(req.params.id, req.params.reviewId, reply);
  if (!product) return res.status(404).json({ error: "ไม่พบสินค้า" });
  res.json({ product });
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateApproval,
  addReview,
  replyToReview,
};
