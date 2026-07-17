// controllers/productController.js
const productModel = require("../models/productModel");
const categoryModel = require("../models/categoryModel");
const orderModel = require("../models/orderModel");

/** เช็คว่า user คนนี้เคยสั่งซื้อสินค้า productId ชิ้นนี้จริง (คำสั่งซื้อที่ไม่ถูกปฏิเสธ) หรือยัง */
function hasPurchasedProduct(userId, productId) {
  const orders = orderModel.getOrdersByUser(userId);
  return orders.some(
    (o) =>
      o.status !== "rejected" &&
      (o.items || []).some((it) => String(it.productId) === String(productId))
  );
}

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

/** POST /api/products/:id/reviews (ลูกค้าที่ login แล้ว และเคยสั่งซื้อสินค้านี้แล้วเท่านั้น) - เพิ่มรีวิวสินค้า */
function addReview(req, res) {
  const { rating, comment } = req.body || {};
  if (!rating || Number(rating) < 1 || Number(rating) > 5) {
    return res.status(400).json({ error: "กรุณาให้คะแนน 1-5 ดาว" });
  }

  const existing = productModel.getProductById(req.params.id);
  if (!existing) return res.status(404).json({ error: "ไม่พบสินค้า" });

  if (!hasPurchasedProduct(req.user.id, req.params.id)) {
    return res.status(403).json({
      error: "คุณต้องสั่งซื้อสินค้านี้ก่อนถึงจะเขียนรีวิวได้",
    });
  }

  const alreadyReviewed = (existing.reviews || []).some(
    (r) => Number(r.userId) === Number(req.user.id)
  );
  if (alreadyReviewed) {
    return res.status(409).json({ error: "คุณได้รีวิวสินค้านี้ไปแล้ว" });
  }

  const product = productModel.addReview(req.params.id, {
    userId: req.user.id,
    customer: req.user.name,
    rating,
    comment,
  });
  if (!product) return res.status(404).json({ error: "ไม่พบสินค้า" });
  res.status(201).json({ product });
}

/** POST /api/products/:id/reviews/:reviewId/reply (employee/admin) - ร้านตอบกลับ/แก้ไขคำตอบรีวิว */
function replyToReview(req, res) {
  const { reply } = req.body || {};
  if (!reply) return res.status(400).json({ error: "กรุณากรอกข้อความตอบกลับ" });

  const product = productModel.replyToReview(req.params.id, req.params.reviewId, reply);
  if (!product) return res.status(404).json({ error: "ไม่พบสินค้า" });
  res.json({ product });
}

/** DELETE /api/products/:id/reviews/:reviewId/reply (employee/admin) - ลบคำตอบของทีมงาน */
function deleteReply(req, res) {
  const existing = productModel.getProductById(req.params.id);
  if (!existing) return res.status(404).json({ error: "ไม่พบสินค้า" });
  const review = (existing.reviews || []).find(
    (r) => String(r.id) === String(req.params.reviewId)
  );
  if (!review) return res.status(404).json({ error: "ไม่พบรีวิวนี้" });

  const product = productModel.deleteReply(req.params.id, req.params.reviewId);
  res.json({ product, message: "ลบคำตอบเรียบร้อยแล้ว" });
}

/** DELETE /api/products/:id/reviews/:reviewId (employee/admin) - ลบรีวิวของลูกค้า */
function deleteReview(req, res) {
  const existing = productModel.getProductById(req.params.id);
  if (!existing) return res.status(404).json({ error: "ไม่พบสินค้า" });
  const review = (existing.reviews || []).find(
    (r) => String(r.id) === String(req.params.reviewId)
  );
  if (!review) return res.status(404).json({ error: "ไม่พบรีวิวนี้" });

  const product = productModel.deleteReview(req.params.id, req.params.reviewId);
  res.json({ product, message: "ลบรีวิวเรียบร้อยแล้ว" });
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
  deleteReply,
  deleteReview,
};