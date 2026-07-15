// orderStore.js
// เชื่อมหน้า Checkout / Order / Tracking เข้ากับ backend จริง (routes/orders.js, controllers/orderController.js)
// เดิมหน้าพวกนี้ผูกกับ mock data ในไฟล์ (เช่น ORDERS ที่ export จาก Tracking.jsx) — ให้เปลี่ยนมาเรียกฟังก์ชันจากที่นี่แทน
//
// ทุกฟังก์ชันเป็น async ทั้งหมด (คืนค่าเป็น Promise) ต้อง await เสมอ
//
// หมายเหตุ field ที่ backend คืนมา (อิงจาก controllers/orderController.js จริง):
// - GET /api/orders                 -> { orders: [...], total }  (ลูกค้าเห็นเฉพาะของตัวเอง)
// - GET /api/orders/:id             -> { order: {...} }
// - POST /api/orders                -> { order: {...} }  (สร้างคำสั่งซื้อ/checkout)
//
// รูปแบบ order object จริงจาก backend:
// { id: "ORD-10231", userId, customer, items: [{productId, name, price, quantity, image}],
//   total, date: "YYYY-MM-DD", status: "pending"|"approved"|"rejected",
//   statusStep: 0-4, statusLabel, address, paymentMethod }
//
// สิทธิ์การเข้าถึง (ดู routes/orders.js): ทุก endpoint ต้อง login (requireAuth) อย่างน้อย

import { api } from "./apiClient";

/** ดึงคำสั่งซื้อของฉัน (ถ้า login เป็น customer จะเห็นเฉพาะของตัวเองอัตโนมัติ) รองรับ filter status */
export async function getMyOrders(filters = {}) {
  const params = new URLSearchParams(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== "")
  );
  const qs = params.toString();
  const data = await api.get(`/api/orders${qs ? `?${qs}` : ""}`);
  return data.orders;
}

/** ดึงคำสั่งซื้อเดียวด้วย id เช่น "ORD-10231" (ใช้กับหน้า Tracking / รายละเอียดคำสั่งซื้อ) */
export async function getOrderById(id) {
  const data = await api.get(`/api/orders/${id}`);
  return data.order;
}

/**
 * สร้างคำสั่งซื้อใหม่ (ยืนยันการสั่งซื้อตอนกด Checkout)
 * @param {{items:Array<{productId, name, price, quantity, image}>, address?:string, paymentMethod?:string}} payload
 *   items ต้องมี productId, quantity (>0) และ price ของทุกชิ้น ไม่งั้น backend จะตอบ error กลับมา
 */
export async function createOrder({ items, address, paymentMethod }) {
  const data = await api.post("/api/orders", { items, address, paymentMethod });
  return data.order;
}

/**
 * แปลง cart items จาก CartContext ให้อยู่ในรูปแบบที่ backend ต้องการก่อนส่ง createOrder
 * (CartContext เก็บ field เพิ่มเช่น key/subtitle/variant/emoji ที่ backend ไม่รู้จัก จึงตัดออกให้)
 */
export function toOrderItems(cartItems) {
  return cartItems.map((i) => ({
    productId: i.id,
    name: i.name,
    price: i.price,
    quantity: i.quantity,
    image: i.image,
  }));
}

/** ป้าย/สีสถานะสำหรับแสดงผล UI อิงจาก status ที่ backend ส่งมา (pending/approved/rejected) */
export function toStatusBadge(status) {
  if (status === "approved") return { label: "อนุมัติแล้ว", tone: "green" };
  if (status === "rejected") return { label: "ถูกปฏิเสธ", tone: "red" };
  return { label: "รอดำเนินการ", tone: "orange" };
}