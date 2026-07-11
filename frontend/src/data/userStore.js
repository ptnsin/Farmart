// userStore.js
// เดิมไฟล์นี้เก็บข้อมูลผู้ใช้ทั้งหมดใน localStorage เอง
// ตอนนี้ backend (Express + JSON file "ฐานข้อมูล") ทำหน้าที่นั้นแทนแล้ว
// ไฟล์นี้จึงเปลี่ยนไปเรียก REST API ของ backend ผ่าน apiClient.js แทน
//
// ทุกฟังก์ชันด้านล่างนี้เป็น async ทั้งหมด (คืนค่าเป็น Promise)
// component ที่เรียกใช้ต้อง await หรือ .then() เสมอ
//
// หมายเหตุ field ที่ backend คืนมา (อิงจาก controllers/userController.js จริง):
// - GET /api/users        -> { users: [...], total }
// - GET /api/users/:id    -> { user: {...} }
// - POST /api/users       -> { user: {...} }
// - PUT /api/users/:id    -> { user: {...} }
// - DELETE /api/users/:id -> { users: [...], message }
// ฟังก์ชันด้านล่างนี้ unwrap object ห่อเหล่านี้ให้แล้ว เพื่อให้ component
// ที่เรียกใช้ได้ array/object ตรง ๆ เหมือนตอนใช้ localStorage เดิม
//
// ทุก endpoint ของ /api/users ต้อง login ด้วย role ADMIN เท่านั้น (ดู routes/users.js)
// ถ้ายังไม่ได้ login หรือ token หมดอายุ จะได้ error กลับมาว่า "กรุณาเข้าสู่ระบบก่อนใช้งาน" (401)
// หรือ "ไม่มีสิทธิ์เข้าถึงข้อมูลนี้" (403)

import { api } from "./apiClient";

/**
 * สมัครสมาชิกใหม่ (สำหรับหน้า Register.jsx) — implementation จริงอยู่ที่ authStore.js
 * (เพราะสมัครสำเร็จแล้ว backend ออก token ให้ทันที ถือเป็นเรื่อง auth/session)
 * export ซ้ำไว้ตรงนี้เพื่อให้ import เดิม `from "../data/userStore"` ยังใช้งานได้ ไม่ต้องแก้ Register.jsx
 */
export { register as registerUser } from "./authStore";

/**
 * ดึงผู้ใช้ทั้งหมด รองรับ filter ผ่าน query string (role, status, search)
 * @param {{role?:string, status?:string, search?:string}} filters
 */
export async function getUsers(filters = {}) {
  const params = new URLSearchParams(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== "")
  );
  const qs = params.toString();
  const data = await api.get(`/api/users${qs ? `?${qs}` : ""}`);
  return data.users;
}

/** ดึงผู้ใช้คนเดียวด้วย id */
export async function getUserById(id) {
  const data = await api.get(`/api/users/${id}`);
  return data.user;
}

/**
 * เพิ่มผู้ใช้ใหม่
 * @param {{name:string,email:string,phone?:string,role:string,status:string,avatar?:string,password?:string}} data
 *   ถ้าไม่ส่ง password มา backend จะตั้งรหัสผ่านเริ่มต้นให้ (ควรให้ผู้ใช้เปลี่ยนรหัสผ่านทีหลัง)
 */
export async function addUser(data) {
  const res = await api.post("/api/users", data);
  return res.user;
}

/** แก้ไขข้อมูลผู้ใช้ (ส่งเฉพาะ field ที่จะเปลี่ยนก็ได้) */
export async function updateUser(id, patch) {
  const data = await api.put(`/api/users/${id}`, patch);
  return data.user;
}

/** แก้ไขสถานะผู้ใช้ (active / suspended) */
export async function updateUserStatus(id, status) {
  const data = await api.put(`/api/users/${id}`, { status });
  return data.user;
}

/** ลบผู้ใช้ - คืนค่ารายชื่อผู้ใช้ที่เหลือทั้งหมดกลับมา (backend ส่งมาให้เลย ไม่ต้อง fetch ซ้ำ) */
export async function deleteUser(id) {
  const data = await api.delete(`/api/users/${id}`);
  return data.users;
}