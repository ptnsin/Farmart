// models/productModel.js
// พอร์ตมาจาก frontend/src/data/productStore.js ให้ทำงานฝั่ง server แทน localStorage

const db = require("../utils/db");
const SEED = require("../data/products.json");

// prefix SKU ตามหมวดหมู่ ให้ตรงกับรูปแบบเดิมใน products.seed.json
// (เมล็ดพันธุ์ -> SD, ฮอร์โมน -> HM, ปุ๋ย -> FT, อุปกรณ์จัดการดิน -> SL, อุปกรณ์รดน้ำ -> WT, กระถาง -> PT)
const CATEGORY_SKU_PREFIX = {
  "เมล็ดพันธุ์": "SD",
  "ฮอร์โมน": "HM",
  "ปุ๋ย": "FT",
  "อุปกรณ์จัดการดิน": "SL",
  "อุปกรณ์รดน้ำ": "WT",
  "กระถาง": "PT",
};

/** สร้าง SKU ถัดไปตามหมวดหมู่ เช่น เมล็ดพันธุ์ตัวล่าสุดคือ SD060 -> ตัวใหม่ได้ SD061 */
function generateSku(category, products) {
  const prefix = CATEGORY_SKU_PREFIX[category] || "GN"; // GN = ทั่วไป กรณีไม่รู้จักหมวดหมู่
  const pattern = new RegExp(`^${prefix}(\\d+)$`);
  const maxNum = products.reduce((max, p) => {
    const match = pattern.exec(p.sku || "");
    return match ? Math.max(max, parseInt(match[1], 10)) : max;
  }, 0);
  return `${prefix}${String(maxNum + 1).padStart(3, "0")}`;
}

function getProducts() {
  return db.read("products", SEED);
}

function saveProducts(products) {
  return db.write("products", products);
}

function getProductById(id) {
  return getProducts().find((p) => String(p.id) === String(id)) || null;
}

function resetProducts() {
  return db.write("products", SEED);
}

function addProduct(data) {
  const products = getProducts();
  const id = db.nextId(products);
  const newProduct = {
    id,
    sku: data.sku || generateSku(data.category, products),
    name: data.name?.trim() || "",
    category: data.category || "",
    unit: data.unit || "",
    price: Number(data.price) || 0,
    cost: Number(data.cost) || 0,
    stockUnits: Number(data.stockUnits) || 0,
    stockPercent: Number(data.stockPercent) || 0,
    stockLevel: data.stockLevel || "healthy",
    farmer: data.farmer || "",
    location: data.location || "",
    description: data.description || "",
    image: data.image || "https://placehold.co/64x64/E2E8F0/475569?text=IMG",
    images: data.images || [],
    reviews: [],
    approvalStatus: data.approvalStatus || "pending",
  };
  saveProducts([newProduct, ...products]);
  return newProduct;
}

function updateProduct(id, patch) {
  const products = getProducts().map((p) =>
    String(p.id) === String(id) ? { ...p, ...patch, id: p.id } : p
  );
  saveProducts(products);
  return products.find((p) => String(p.id) === String(id)) || null;
}

function deleteProduct(id) {
  const products = getProducts().filter((p) => String(p.id) !== String(id));
  saveProducts(products);
  return products;
}

function replyToReview(productId, reviewId, replyText) {
  const products = getProducts().map((p) => {
    if (String(p.id) !== String(productId)) return p;
    return {
      ...p,
      reviews: p.reviews.map((r) =>
        String(r.id) === String(reviewId) ? { ...r, reply: replyText } : r
      ),
    };
  });
  saveProducts(products);
  return products.find((p) => String(p.id) === String(productId)) || null;
}

/** ลบคำตอบของทีมงานออกจากรีวิว (รีวิวยังอยู่ แต่กลับไปสถานะยังไม่มีคำตอบ) */
function deleteReply(productId, reviewId) {
  const products = getProducts().map((p) => {
    if (String(p.id) !== String(productId)) return p;
    return {
      ...p,
      reviews: p.reviews.map((r) =>
        String(r.id) === String(reviewId) ? { ...r, reply: "" } : r
      ),
    };
  });
  saveProducts(products);
  return products.find((p) => String(p.id) === String(productId)) || null;
}

/** ลบรีวิวของลูกค้าออกทั้งรายการ (รวมคำตอบที่ตอบไปด้วย) */
function deleteReview(productId, reviewId) {
  const products = getProducts().map((p) => {
    if (String(p.id) !== String(productId)) return p;
    return { ...p, reviews: (p.reviews || []).filter((r) => String(r.id) !== String(reviewId)) };
  });
  saveProducts(products);
  return products.find((p) => String(p.id) === String(productId)) || null;
}

function addReview(productId, { customer, rating, comment }) {
  const products = getProducts();
  const product = products.find((p) => String(p.id) === String(productId));
  if (!product) return null;
  const nextReviewId = (product.reviews || []).reduce((m, r) => Math.max(m, r.id || 0), 0) + 1;
  const review = {
    id: nextReviewId,
    customer,
    rating: Number(rating) || 5,
    date: new Date().toISOString(),
    comment: comment || "",
    reply: "",
  };
  const updated = products.map((p) =>
    String(p.id) === String(productId) ? { ...p, reviews: [...(p.reviews || []), review] } : p
  );
  saveProducts(updated);
  return updated.find((p) => String(p.id) === String(productId));
}

module.exports = {
  getProducts,
  saveProducts,
  getProductById,
  resetProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  replyToReview,
  deleteReply,
  deleteReview,
  addReview,
};