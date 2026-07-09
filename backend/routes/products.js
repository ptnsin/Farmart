// routes/products.js
const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { requireRole, requireAuth } = require("../middleware/auth");

// GET /api/products - public รองรับ query: category, search, stockLevel, approvalStatus
router.get("/", productController.getProducts);

// GET /api/products/:id - public
router.get("/:id", productController.getProductById);

// POST /api/products (employee/admin) - เพิ่มสินค้าใหม่ (เข้าสถานะ pending รออนุมัติถ้าเป็น employee)
router.post("/", requireRole("EMPLOYEE", "ADMIN"), productController.createProduct);

// PUT /api/products/:id (employee/admin) - แก้ไขสินค้า
router.put("/:id", requireRole("EMPLOYEE", "ADMIN"), productController.updateProduct);

// DELETE /api/products/:id (employee/admin)
router.delete("/:id", requireRole("EMPLOYEE", "ADMIN"), productController.deleteProduct);

// PATCH /api/products/:id/approval (admin only) - อนุมัติ/ปฏิเสธสินค้าที่พนักงานเพิ่ม
router.patch("/:id/approval", requireRole("ADMIN"), productController.updateApproval);

// POST /api/products/:id/reviews (ลูกค้าที่ login แล้ว) - เพิ่มรีวิวสินค้า
router.post("/:id/reviews", requireAuth, productController.addReview);

// POST /api/products/:id/reviews/:reviewId/reply (employee/admin) - ร้านตอบกลับรีวิว
router.post(
  "/:id/reviews/:reviewId/reply",
  requireRole("EMPLOYEE", "ADMIN"),
  productController.replyToReview
);

module.exports = router;
