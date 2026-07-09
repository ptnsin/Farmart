// routes/categories.js
const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { requireRole } = require("../middleware/auth");

// GET /api/categories - public
router.get("/", categoryController.getCategories);

// GET /api/categories/:id - public
router.get("/:id", categoryController.getCategoryById);

// POST /api/categories (employee/admin)
router.post("/", requireRole("EMPLOYEE", "ADMIN"), categoryController.createCategory);

// PUT /api/categories/:id (employee/admin)
router.put("/:id", requireRole("EMPLOYEE", "ADMIN"), categoryController.updateCategory);

// DELETE /api/categories/:id (admin only)
router.delete("/:id", requireRole("ADMIN"), categoryController.deleteCategory);

module.exports = router;
