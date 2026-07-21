// productStore.js
// เดิมไฟล์นี้เก็บข้อมูลสินค้าทั้งหมดใน localStorage เอง (seed มาจาก productsData.js / Excel)
// ตอนนี้ backend ทำหน้าที่นั้นแทนแล้ว (ดู backend/data/products.seed.json)
// ไฟล์ productsData.js เดิมไม่ได้ใช้แล้ว เพราะ backend มี seed ของตัวเองอยู่แล้ว ลบทิ้งได้
//
// ทุกฟังก์ชันด้านล่างนี้เป็น async ทั้งหมด (คืนค่าเป็น Promise) ต้อง await เสมอ
//
// หมายเหตุ field ที่ backend คืนมา (อิงจาก controllers/productController.js จริง):
// - GET /api/products                          -> { products: [...], total }
// - GET /api/products/:id                      -> { product: {...} }
// - POST /api/products                         -> { product: {...} }
// - PUT /api/products/:id                      -> { product: {...} }
// - DELETE /api/products/:id                   -> { products: [...], message }
// - PATCH /api/products/:id/approval           -> { product: {...} } (body ต้องเป็น approvalStatus ไม่ใช่ status!)
// - POST /api/products/:id/reviews             -> { product: {...} } (ไม่ต้องส่ง customer, backend ใช้ req.user.name เอง)
// - POST /api/products/:id/reviews/:rid/reply  -> { product: {...} }
// ฟังก์ชันด้านล่างนี้ unwrap object ห่อเหล่านี้ให้แล้ว
//
// สิทธิ์การเข้าถึง (ดู routes/products.js):
// - GET ดูสินค้า: public ไม่ต้อง login
// - POST/PUT/DELETE: ต้อง login เป็น EMPLOYEE หรือ ADMIN
// - PATCH .../approval (อนุมัติ/ปฏิเสธ): ต้อง login เป็น ADMIN เท่านั้น
// - POST รีวิว: ต้อง login (role อะไรก็ได้)
// - ตอบกลับรีวิว: ต้อง login เป็น EMPLOYEE หรือ ADMIN

import { api, API_URL } from "./apiClient";

/**
 * แปลง path รูปที่ backend ส่งมาให้เป็น URL เต็มที่ browser โหลดได้จริง
 * - ถ้าเป็น URL เต็มอยู่แล้ว (http://, https://, data:) ปล่อยผ่านเลย ไม่ต้องแตะ
 * - ถ้าเป็น relative path เช่น "/uploads/xxx.jpg" หรือ "uploads/xxx.jpg" ให้ต่อกับ API_URL ของ backend
 *   (เพราะ frontend กับ backend รันคนละ origin กัน เช่น :5173 vs :4000
 *    ใส่แค่ "/uploads/xxx.jpg" ตรง ๆ ใน <img src> browser จะไปหาไฟล์ที่ origin ของ frontend แทน เลยไม่เจอ)
 * - ถ้าไม่มีค่าเลย คืน "" (ให้ onError ใน UI แสดง placeholder ตามที่ตั้งไว้)
 */
function resolveImageUrl(path) {
  if (!path) return "";
  if (/^(https?:\/\/|data:)/i.test(path)) return path;
  return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

/** แปลง field รูปของสินค้า 1 ชิ้น (image + images[]) ให้เป็น URL เต็มทั้งหมด */
function withResolvedImages(product) {
  if (!product) return product;
  return {
    ...product,
    image: resolveImageUrl(product.image),
    images: Array.isArray(product.images) ? product.images.map(resolveImageUrl) : product.images,
  };
}

/**
 * ดึงสินค้าทั้งหมด รองรับ filter ผ่าน query string
 * @param {{category?:string, search?:string, stockLevel?:string, approvalStatus?:string}} filters
 */
export async function getProducts(filters = {}) {
  const params = new URLSearchParams(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== "")
  );
  const qs = params.toString();
  const data = await api.get(`/api/products${qs ? `?${qs}` : ""}`);
  return data.products.map(withResolvedImages);
}

/** ดึงสินค้าชิ้นเดียวด้วย id */
export async function getProductById(id) {
  const data = await api.get(`/api/products/${id}`);
  return withResolvedImages(data.product);
}

/** เพิ่มสินค้าใหม่ (employee เพิ่มแล้วจะเข้าสถานะ pending รอ admin อนุมัติ ระบบฝั่ง backend จัดการให้เอง) */
export async function addProduct(data) {
  const res = await api.post("/api/products", data);
  return withResolvedImages(res.product);
}

/** แก้ไขข้อมูลสินค้า (ส่งเฉพาะ field ที่จะเปลี่ยนก็ได้) */
export async function updateProduct(id, patch) {
  const data = await api.put(`/api/products/${id}`, patch);
  return withResolvedImages(data.product);
}

/** ลบสินค้า - คืนค่ารายการสินค้าที่เหลือทั้งหมดกลับมา */
export async function deleteProduct(id) {
  const data = await api.delete(`/api/products/${id}`);
  return data.products.map(withResolvedImages);
}

/**
 * อนุมัติ/ปฏิเสธสินค้าที่พนักงานเพิ่มเข้ามา (admin เท่านั้น)
 * @param {string|number} id
 * @param {"approved"|"rejected"|"pending"} approvalStatus
 */
export async function updateApproval(id, approvalStatus) {
  const data = await api.patch(`/api/products/${id}/approval`, { approvalStatus });
  return withResolvedImages(data.product);
}

/**
 * เพิ่มรีวิวสินค้า (ต้อง login) — ไม่ต้องส่งชื่อลูกค้า backend ดึงจาก user ที่ login เอง
 * @param {string|number} productId
 * @param {{rating:number, comment?:string}} review
 */
export async function addReview(productId, { rating, comment }) {
  const data = await api.post(`/api/products/${productId}/reviews`, { rating, comment });
  return withResolvedImages(data.product);
}

/** ตอบกลับ/แก้ไขคำตอบรีวิวของสินค้า (employee/admin เท่านั้น) เรียกซ้ำได้เรื่อย ๆ เพื่อแก้ไขคำตอบเดิม */
export async function replyToReview(productId, reviewId, replyText) {
  const data = await api.post(`/api/products/${productId}/reviews/${reviewId}/reply`, {
    reply: replyText,
  });
  return withResolvedImages(data.product);
}

/** ลบคำตอบของทีมงานออกจากรีวิว (รีวิวยังอยู่ แต่กลับไปสถานะยังไม่มีคำตอบ) */
export async function deleteReply(productId, reviewId) {
  const data = await api.delete(`/api/products/${productId}/reviews/${reviewId}/reply`);
  return withResolvedImages(data.product);
}

/** ลบรีวิวของลูกค้าออกทั้งรายการ (employee/admin เท่านั้น) */
export async function deleteReview(productId, reviewId) {
  const data = await api.delete(`/api/products/${productId}/reviews/${reviewId}`);
  return withResolvedImages(data.product);
}

/**
 * แปลงสินค้าจาก backend (schema จริง: sku, category, unit, stockUnits, farmer, location, ...)
 * ให้อยู่ในรูปแบบที่หน้า Products.jsx / ProductDetail.jsx (ที่แต่เดิมออกแบบมาคู่กับ productsData.js mock)
 * ใช้งานได้เลยโดยไม่ต้องเขียน UI ใหม่ทั้งหมด — คำนวณ rating/ratingCount จาก reviews จริง
 * และ map field ที่ชื่อไม่ตรงกัน (origin <- location, gallery <- images, specs <- sku/unit/farmer/location)
 *
 * หมายเหตุ: รับ product ที่ผ่าน withResolvedImages มาแล้ว (จากฟังก์ชันข้างบน) image/images
 * จึงเป็น URL เต็มอยู่แล้ว ไม่ต้องแปลงซ้ำตรงนี้
 */
export function toDisplayProduct(p) {
  if (!p) return null;
  const reviews = p.reviews || [];
  const ratingCount = reviews.length;
  const rating = ratingCount
    ? Math.round((reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / ratingCount) * 10) / 10
    : 0;

  let badge = null;
  if (p.stockLevel === "out") badge = { label: "สินค้าหมด", tone: "outline" };
  else if (p.stockLevel === "low") badge = { label: "ใกล้หมด", tone: "orange" };
  else if (rating >= 4.8 && ratingCount >= 3) badge = { label: "ขายดี", tone: "green" };

  return {
    id: p.id,
    name: p.name,
    category: p.category,
    tag: p.category,
    badge,
    price: Number(p.price) || 0,
    origin: p.location || "",
    rating,
    ratingCount,
    image: p.image,
    gallery: p.images?.length ? p.images : [p.image].filter(Boolean),
    description: p.description || "",
    sku: p.sku,
    unit: p.unit,
    farmer: p.farmer,
    stockUnits: p.stockUnits,
    stockLevel: p.stockLevel,
    specs: {
      "รหัสสินค้า": p.sku || "-",
      "หน่วยขาย": p.unit || "-",
      "จำหน่ายโดย": p.farmer || "-",
      "แหล่งผลิต": p.location || "-",
    },
    reviews: reviews.map((r) => ({
      id: r.id,
      name: r.customer,
      avatar: resolveImageUrl(r.avatar),
      rating: r.rating,
      date: r.date,
      comment: r.comment,
      reply: r.reply,
      helpful: 0,
      verified: true,
    })),
  };
}