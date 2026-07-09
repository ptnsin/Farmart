// models/categoryModel.js
// จัดการข้อมูลหมวดหมู่สินค้า อ่าน/เขียนผ่าน utils/db.js (JSON file database)

const db = require("../utils/db");
const SEED = require("../data/categories.seed.json");

/** ดึงหมวดหมู่ทั้งหมด */
function getCategories() {
  return db.read("categories", SEED);
}

/** เขียนทับหมวดหมู่ทั้งหมด */
function saveCategories(categories) {
  return db.write("categories", categories);
}

/** หาหมวดหมู่จาก id */
function getCategoryById(id) {
  return getCategories().find((c) => String(c.id) === String(id)) || null;
}

/** หาหมวดหมู่จากชื่อ (ใช้ตรวจสอบชื่อซ้ำ) */
function findCategoryByName(name) {
  const target = String(name).trim().toLowerCase();
  return getCategories().find((c) => c.name.trim().toLowerCase() === target) || null;
}

/** สร้าง slug อัตโนมัติจากชื่อถ้าไม่ได้ระบุมา */
function slugify(name) {
  return String(name)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

/** เพิ่มหมวดหมู่ใหม่ */
function addCategory(data) {
  const categories = getCategories();
  const id = db.nextId(categories);
  const newCategory = {
    id,
    name: data.name.trim(),
    slug: data.slug?.trim() || slugify(data.name),
    description: data.description || "",
    icon: data.icon || "📦",
    status: data.status || "active",
  };
  saveCategories([newCategory, ...categories]);
  return newCategory;
}

/** แก้ไขหมวดหมู่ */
function updateCategory(id, patch) {
  const categories = getCategories().map((c) =>
    String(c.id) === String(id) ? { ...c, ...patch, id: c.id } : c
  );
  saveCategories(categories);
  return categories.find((c) => String(c.id) === String(id)) || null;
}

/** ลบหมวดหมู่ */
function deleteCategory(id) {
  const categories = getCategories().filter((c) => String(c.id) !== String(id));
  saveCategories(categories);
  return categories;
}

module.exports = {
  getCategories,
  saveCategories,
  getCategoryById,
  findCategoryByName,
  addCategory,
  updateCategory,
  deleteCategory,
};
