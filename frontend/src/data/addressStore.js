// src/data/addressStore.js
// ตัวกลางคุยกับ backend จริง (routes/address.js) สำหรับสมุดที่อยู่
// ทำหน้าที่คล้าย ๆ orderStore.js / authStore.js ที่มีอยู่แล้วในโปรเจกต์
//
// สำคัญ: routes/address.js ดึง ownerId/ownerName จาก req.user (แนบมากับ token โดย
// middleware/auth.js) เท่านั้น ไม่รับ ownerId จาก query string หรือ ownerId/ownerName
// จาก body เลย — apiClient.js แนบ Authorization: Bearer <token> ให้อัตโนมัติอยู่แล้ว
// จึงไม่ต้องส่ง/รับ ownerId เองจากฝั่ง client

import { api } from "./apiClient";

// เก็บ cache ไว้ในหน่วยความจำระหว่าง session เดียวกัน (คล้าย getCachedUser)
let cachedAddresses = null;

export function getCachedAddresses() {
  return cachedAddresses;
}

// ดึงที่อยู่ทั้งหมดของผู้ใช้ที่ login อยู่ (backend กรองด้วย token ให้อัตโนมัติ)
export async function fetchAddresses() {
  const list = await api.get("/api/addresses");
  cachedAddresses = Array.isArray(list) ? list : [];
  return cachedAddresses;
}

// บันทึกที่อยู่ใหม่ลง backend แล้วอัปเดต cache
// payload: { label, recipientName, phone, addressLine, subdistrict, district, province, postalCode }
export async function createAddress(payload) {
  const saved = await api.post("/api/addresses", payload);
  if (cachedAddresses) cachedAddresses = [...cachedAddresses, saved];
  return saved;
}

// ลบที่อยู่ออกจาก backend แล้วอัปเดต cache
export async function deleteAddress(id) {
  await api.delete(`/api/addresses/${encodeURIComponent(id)}`);
  if (cachedAddresses) cachedAddresses = cachedAddresses.filter((a) => a.id !== id);
}

// ตั้งที่อยู่หนึ่งรายการเป็นค่าเริ่มต้น (PATCH /api/addresses/:id/default มีใน backend แล้ว
// เผื่ออยากทำปุ่ม "ตั้งเป็นค่าเริ่มต้น" ในอนาคต — ยังไม่ได้ผูกกับ UI ตอนนี้)
export async function setDefaultAddress(id) {
  const updated = await api.patch(`/api/addresses/${encodeURIComponent(id)}/default`);
  if (cachedAddresses) {
    cachedAddresses = cachedAddresses.map((a) => ({ ...a, isDefault: a.id === id }));
  }
  return updated;
}
