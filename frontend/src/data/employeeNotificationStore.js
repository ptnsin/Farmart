// employeeNotificationStore.js
// ระบบแจ้งเตือนฝั่งพนักงาน — ต่างจาก notificationStore.js (ฝั่งลูกค้า) ตรงที่ "ไม่ seed ข้อมูลลง
// localStorage" เพราะยังไม่มี backend notification model จริง แจ้งเตือนที่นี่จึง "คำนวณสด" จาก
// ข้อมูลจริงที่มี endpoint อยู่แล้ว (orders, shipments, products) ทุกครั้งที่เรียก
// fetchEmployeeNotifications() แทนที่จะเก็บเป็น record ถาวร — ข้อดีคือไม่มีวันข้อมูล "ค้าง" ไม่ตรงกับ
// สถานะจริงในระบบ ข้อเสียคือไม่มีสถานะ read/unread แบบเก็บถาวรข้ามเซสชัน (จึงใช้ localStorage เก็บแค่
// "รายการ id ที่กดอ่านแล้ว" แยกไว้ต่างหาก เพื่อให้ยังกดอ่าน/มาร์คอ่านทั้งหมดได้เหมือนฝั่งลูกค้า)

import { api } from "./apiClient";

const READ_IDS_KEY = "farmart_employee_notification_read_ids";
const listeners = new Set();

function emitChange(list) {
  listeners.forEach((cb) => {
    try {
      cb(list);
    } catch {
      /* ignore listener errors */
    }
  });
}

export function subscribeEmployeeNotifications(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getReadIds() {
  try {
    const raw = localStorage.getItem(READ_IDS_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveReadIds(set) {
  localStorage.setItem(READ_IDS_KEY, JSON.stringify([...set]));
}

// id ของแจ้งเตือนคำนวณแบบ deterministic จากตัวข้อมูลจริงเอง (ไม่สุ่ม) เพื่อให้ read-state
// ที่เก็บไว้ใน localStorage ยัง map เข้ากับแจ้งเตือนตัวเดิมได้ถูกต้องในการโหลดครั้งถัดไป
function makeId(parts) {
  return parts.join(":");
}

/** คำสั่งซื้อที่ status === "pending" ยังไม่ถูกตรวจสอบ */
function buildPendingOrderNotifications(orders) {
  return orders
    .filter((o) => o.status === "pending")
    .map((o) => ({
      id: makeId(["pending-order", o.id]),
      type: "order",
      title: `คำสั่งซื้อ ${o.id} รอตรวจสอบ`,
      message: `${o.customer || "ลูกค้า"} สั่งซื้อมูลค่า ฿${(o.total || 0).toLocaleString()} รอการอนุมัติ`,
      // ใช้วันที่สร้างออเดอร์แทน "เวลาที่แจ้งเตือน" เพราะไม่มี timestamp การแจ้งเตือนจริง
      createdAt: o.date ? new Date(o.date).getTime() : Date.now(),
      link: "/employee/orders",
    }));
}

/** shipment ที่ eta เลยกำหนดแล้วแต่ยังไม่ delivered */
function buildLateShipmentNotifications(shipments) {
  const now = Date.now();
  return shipments
    .filter((s) => {
      if (s.status === "delivered" || !s.eta) return false;
      const eta = new Date(s.eta).getTime();
      return !Number.isNaN(eta) && eta < now;
    })
    .map((s) => ({
      id: makeId(["late-shipment", s.id]),
      type: "shipment",
      title: `การจัดส่ง ${s.id} ล่าช้ากว่ากำหนด`,
      message: `อ้างอิงคำสั่งซื้อ ${s.order || "-"} ผ่าน ${s.carrier || "-"} เลยกำหนดส่ง (ETA) แล้ว`,
      createdAt: new Date(s.eta).getTime(),
      link: "/employee/shipping",
    }));
}

/** สินค้าที่ stockLevel เป็น "low" หรือ "out" (คำนวณมาจาก backend แล้ว ไม่ต้องเดา threshold เอง) */
function buildLowStockNotifications(products) {
  return products
    .filter((p) => p.stockLevel === "low" || p.stockLevel === "out")
    .map((p) => {
      const isOut = p.stockLevel === "out";
      return {
        id: makeId(["low-stock", p.id]),
        type: "stock",
        title: isOut ? `${p.name} สินค้าหมด` : `${p.name} ใกล้หมดสต็อก`,
        message: isOut
          ? `${p.sku || p.id} ไม่พร้อมขายในขณะนี้ ควรเติมสต็อกด่วน`
          : `${p.sku || p.id} เหลือ ${p.stockUnits ?? 0} ${p.unit || "หน่วย"} ควรเติมสต็อกเร็ว ๆ นี้`,
        // ไม่มี timestamp จริงว่าของหมดตอนไหน ใช้เวลาปัจจุบันตอนคำนวณแทน (แจ้งเตือนกลุ่มนี้คำนวณสดทุกครั้งอยู่แล้ว)
        createdAt: Date.now(),
        link: "/employee/warehouse",
      };
    });
}

/** ดึงแจ้งเตือนสดจาก backend ทุกครั้ง แล้วผสาน read-state ที่เก็บไว้ใน localStorage เข้าไป */
export async function fetchEmployeeNotifications() {
  const [ordersRes, shipmentsRes, productsRes] = await Promise.all([
    api.get("/api/orders?status=pending"),
    api.get("/api/shipments"),
    api.get("/api/products"),
  ]);

  const orders = ordersRes?.orders || [];
  const shipments = shipmentsRes?.shipments || [];
  const products = Array.isArray(productsRes) ? productsRes : productsRes?.products || [];

  const list = [
    ...buildPendingOrderNotifications(orders),
    ...buildLateShipmentNotifications(shipments),
    ...buildLowStockNotifications(products),
  ].sort((a, b) => b.createdAt - a.createdAt);

  const readIds = getReadIds();
  const withReadState = list.map((n) => ({ ...n, read: readIds.has(n.id) }));

  emitChange(withReadState);
  return withReadState;
}

export async function markAsRead(id) {
  const readIds = getReadIds();
  readIds.add(id);
  saveReadIds(readIds);
  return fetchEmployeeNotifications();
}

export async function markAllAsRead(currentList) {
  const readIds = getReadIds();
  currentList.forEach((n) => readIds.add(n.id));
  saveReadIds(readIds);
  return fetchEmployeeNotifications();
}

export function unreadCount(list) {
  return list.filter((n) => !n.read).length;
}