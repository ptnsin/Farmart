// promotionStore.js
// คุยกับ backend จริงผ่าน routes/promotions.js
// ทุกฟังก์ชันด้านล่างนี้เป็น async ทั้งหมด (คืนค่าเป็น Promise) ต้อง await เสมอ
//
// หมายเหตุ field ที่ backend คืนมา (อิงจาก controllers/promotionController.js จริง):
// - GET /api/promotions              -> { promotions: [...], total }   (public)
// - GET /api/promotions/check/:code  -> { promotion: {...} }           (public)
// - POST /api/promotions             -> { promotion: {...} }           (admin only)
// - PUT /api/promotions/:id          -> { promotion: {...} }           (admin only)
// - PATCH /api/promotions/:id/toggle -> { promotion: {...} }           (admin only)
// - DELETE /api/promotions/:id       -> { promotions: [...], message } (admin only)

import { api } from "./apiClient";

/** ดึงโปรโมชั่นทั้งหมด รองรับ filter สถานะ */
export async function getPromotions(filters = {}) {
  const params = new URLSearchParams(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== "")
  );
  const qs = params.toString();
  const data = await api.get(`/api/promotions${qs ? `?${qs}` : ""}`);
  return data.promotions;
}

/** ตรวจสอบโค้ดส่วนลด (ใช้ตอน checkout) */
export async function checkPromotionCode(code) {
  const data = await api.get(`/api/promotions/check/${code}`);
  return data.promotion;
}

/**
 * สร้างโปรโมชั่นใหม่ (admin เท่านั้น)
 * @param {{code?:string, description:string, type:"percent"|"fixed", value:number, period?:string, status?:"active"|"scheduled"|"expired"}} data
 */
export async function addPromotion(data) {
  const res = await api.post("/api/promotions", data);
  return res.promotion;
}

/** แก้ไขโปรโมชั่น (ส่งเฉพาะ field ที่จะเปลี่ยนก็ได้) */
export async function updatePromotion(id, patch) {
  const data = await api.put(`/api/promotions/${id}`, patch);
  return data.promotion;
}

/** สลับสถานะ active/expired */
export async function togglePromotionStatus(id) {
  const data = await api.patch(`/api/promotions/${id}/toggle`, {});
  return data.promotion;
}

/** ลบโปรโมชั่น - คืนค่ารายการที่เหลือทั้งหมดกลับมา */
export async function deletePromotion(id) {
  const data = await api.delete(`/api/promotions/${id}`);
  return data.promotions;
}