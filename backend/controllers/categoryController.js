// controllers/categoryController.js
const categoryModel = require("../models/categoryModel");
const productModel = require("../models/productModel");

/** GET /api/categories - รายการหมวดหมู่ทั้งหมด (public) */
function getCategories(req, res) {
  const categories = categoryModel.getCategories();
  res.json({ categories, total: categories.length });
}

/** GET /api/categories/:id */
function getCategoryById(req, res) {
  const category = categoryModel.getCategoryById(req.params.id);
  if (!category) return res.status(404).json({ error: "ไม่พบหมวดหมู่นี้" });
  res.json({ category });
}

/** POST /api/categories (employee/admin) - เพิ่มหมวดหมู่ใหม่ */
function createCategory(req, res) {
  const { name } = req.body || {};
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "กรุณากรอกชื่อหมวดหมู่" });
  }
  if (categoryModel.findCategoryByName(name)) {
    return res.status(409).json({ error: "หมวดหมู่นี้มีอยู่ในระบบแล้ว" });
  }

  const category = categoryModel.addCategory(req.body);
  res.status(201).json({ category });
}

/** PUT /api/categories/:id (employee/admin) - แก้ไขหมวดหมู่ */
function updateCategory(req, res) {
  const existing = categoryModel.getCategoryById(req.params.id);
  if (!existing) return res.status(404).json({ error: "ไม่พบหมวดหมู่นี้" });

  const patch = { ...req.body };
  if (patch.name) {
    const dup = categoryModel.findCategoryByName(patch.name);
    if (dup && String(dup.id) !== String(existing.id)) {
      return res.status(409).json({ error: "ชื่อหมวดหมู่นี้ถูกใช้งานแล้ว" });
    }
  }

  const category = categoryModel.updateCategory(req.params.id, patch);
  res.json({ category });
}

/** DELETE /api/categories/:id (admin only) - ลบไม่ได้ถ้ายังมีสินค้าผูกอยู่ */
function deleteCategory(req, res) {
  const existing = categoryModel.getCategoryById(req.params.id);
  if (!existing) return res.status(404).json({ error: "ไม่พบหมวดหมู่นี้" });

  const productsInCategory = productModel.getProducts().filter((p) => p.category === existing.name);
  if (productsInCategory.length > 0) {
    return res.status(409).json({
      error: `ไม่สามารถลบหมวดหมู่นี้ได้ เนื่องจากยังมีสินค้าผูกอยู่ ${productsInCategory.length} รายการ`,
    });
  }

  const categories = categoryModel.deleteCategory(req.params.id);
  res.json({ categories, message: "ลบหมวดหมู่เรียบร้อยแล้ว" });
}

module.exports = { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory };
