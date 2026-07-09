// productStore.js
// เก็บและจัดการข้อมูลสินค้าทั้งหมดผ่าน localStorage
// ทำหน้าที่เป็น "ฐานข้อมูลจำลอง" ฝั่ง client ให้ AdminInventory และ AdminProductDetail ใช้ร่วมกัน
//
// วิธีทำงาน (แนวคิดเดียวกับ userStore.js):
// 1. ข้อมูลสินค้าเริ่มต้น (seed) อยู่ใน productsData.js ซึ่งแปลงมาจากไฟล์ Excel
// 2. ครั้งแรกที่เว็บถูกเปิด จะไม่มีข้อมูลใน localStorage เลย -> getProducts() จะ
//    copy ค่าเริ่มต้นจาก productsData.js ใส่ลง localStorage ให้อัตโนมัติ (JSON.stringify)
// 3. ครั้งถัดไปที่เปิดเว็บ จะอ่านจาก localStorage ตรง ๆ (JSON.parse) ไม่ต้อง seed ซ้ำ
// 4. ทุกการแก้ไข (เพิ่ม/แก้/ลบสินค้า, ตอบกลับรีวิว) จะเขียนทับ localStorage ทันที

import DEFAULT_PRODUCTS from "./productsData";

const STORAGE_KEY = "farmart_admin_products";

function readRaw() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeRaw(products) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

/** ดึงสินค้าทั้งหมด ถ้ายังไม่มีข้อมูลใน localStorage จะ seed ค่าเริ่มต้นให้อัตโนมัติ */
export function getProducts() {
  const existing = readRaw();
  if (existing && Array.isArray(existing)) return existing;
  writeRaw(DEFAULT_PRODUCTS);
  return DEFAULT_PRODUCTS;
}

/** ดึงสินค้าชิ้นเดียวด้วย id (id จาก useParams เป็น string เลยแปลงให้เทียบกันได้) */
export function getProductById(id) {
  return getProducts().find((p) => String(p.id) === String(id)) || null;
}

/** บันทึกสินค้าทั้งหมดทับของเดิม */
export function saveProducts(products) {
  writeRaw(products);
  return products;
}

/** รีเซ็ตกลับเป็นข้อมูลเริ่มต้นจากไฟล์ Excel */
export function resetProducts() {
  writeRaw(DEFAULT_PRODUCTS);
  return DEFAULT_PRODUCTS;
}

function nextId(products) {
  return products.reduce((max, p) => Math.max(max, p.id), 0) + 1;
}

/** เพิ่มสินค้าใหม่ */
export function addProduct(data) {
  const products = getProducts();
  const id = nextId(products);
  const newProduct = {
    id,
    sku: data.sku || `SKU${String(id).padStart(4, "0")}`,
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
  };
  const updated = [newProduct, ...products];
  writeRaw(updated);
  return newProduct;
}

/** แก้ไขข้อมูลสินค้า (ส่งเฉพาะ field ที่จะเปลี่ยนก็ได้) */
export function updateProduct(id, patch) {
  const products = getProducts().map((p) => (p.id === id ? { ...p, ...patch } : p));
  writeRaw(products);
  return products;
}

/** ลบสินค้า */
export function deleteProduct(id) {
  const products = getProducts().filter((p) => p.id !== id);
  writeRaw(products);
  return products;
}

/** ตอบกลับรีวิวของสินค้าชิ้นหนึ่ง แล้วบันทึกลง localStorage ทันที */
export function replyToReview(productId, reviewId, replyText) {
  const products = getProducts().map((p) => {
    if (String(p.id) !== String(productId)) return p;
    return {
      ...p,
      reviews: p.reviews.map((r) => (r.id === reviewId ? { ...r, reply: replyText } : r)),
    };
  });
  writeRaw(products);
  return products.find((p) => String(p.id) === String(productId));
}