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

import { api } from "./apiClient";

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
  return data.products;
}

/** ดึงสินค้าชิ้นเดียวด้วย id */
export async function getProductById(id) {
  const data = await api.get(`/api/products/${id}`);
  return data.product;
}

/** เพิ่มสินค้าใหม่ (employee เพิ่มแล้วจะเข้าสถานะ pending รอ admin อนุมัติ ระบบฝั่ง backend จัดการให้เอง) */
export async function addProduct(data) {
  const res = await api.post("/api/products", data);
  return res.product;
}

/** แก้ไขข้อมูลสินค้า (ส่งเฉพาะ field ที่จะเปลี่ยนก็ได้) */
export async function updateProduct(id, patch) {
  const data = await api.put(`/api/products/${id}`, patch);
  return data.product;
}

/** ลบสินค้า - คืนค่ารายการสินค้าที่เหลือทั้งหมดกลับมา */
export async function deleteProduct(id) {
  const data = await api.delete(`/api/products/${id}`);
  return data.products;
}

/**
 * อนุมัติ/ปฏิเสธสินค้าที่พนักงานเพิ่มเข้ามา (admin เท่านั้น)
 * @param {string|number} id
 * @param {"approved"|"rejected"|"pending"} approvalStatus
 */
export async function updateApproval(id, approvalStatus) {
  const data = await api.patch(`/api/products/${id}/approval`, { approvalStatus });
  return data.product;
}

/**
 * เพิ่มรีวิวสินค้า (ต้อง login) — ไม่ต้องส่งชื่อลูกค้า backend ดึงจาก user ที่ login เอง
 * @param {string|number} productId
 * @param {{rating:number, comment?:string}} review
 */
export async function addReview(productId, { rating, comment }) {
  const data = await api.post(`/api/products/${productId}/reviews`, { rating, comment });
  return data.product;
}

/** ตอบกลับรีวิวของสินค้า (employee/admin เท่านั้น) */
export async function replyToReview(productId, reviewId, replyText) {
  const data = await api.post(`/api/products/${productId}/reviews/${reviewId}/reply`, {
    reply: replyText,
  });
  return data.product;
}