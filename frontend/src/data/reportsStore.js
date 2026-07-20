// reportsStore.js
// Data service สำหรับหน้า Admin Reports/Dashboard
// ใช้ apiClient.js ตัวเดียวกับ authStore.js เพื่อให้แนบ Authorization: Bearer <token>
// ให้อัตโนมัติทุก request (ระบบนี้ auth ด้วย token ใน localStorage ไม่ใช่ cookie/session)

import { api } from "./apiClient";

/**
 * ดึงข้อมูลภาพรวม dashboard: stat cards (revenue, orders, newCustomers),
 * ยอดขายรายเดือน 7 เดือนล่าสุด, สินค้าขายดี 5 อันดับ
 * ตรงกับ GET /api/reports/dashboard-summary
 */
export async function fetchReportsOverview() {
  return api.get("/api/reports/dashboard-summary");
}

/**
 * ดึงรายการตั๋ว support กรองตาม role ของผู้แจ้ง
 * ตรงกับ GET /api/support?role=...
 */
function fetchSupportTickets(role, params = {}) {
  const query = new URLSearchParams({
    role,
    ...Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== "")),
  }).toString();
  return api.get(`/api/support?${query}`);
}

/**
 * ดึงรายการปัญหาที่พนักงานแจ้งเข้ามา (support tickets ที่ role === "EMPLOYEE")
 * @param {{status?: "open"|"resolved", type?: "delivery"|"stock"|"system", priority?: "high"|"medium"|"low"}} params
 */
export function fetchEmployeeIssues(params = {}) {
  return fetchSupportTickets("EMPLOYEE", params);
}

/**
 * ดึงรายการปัญหา/คำถามที่ลูกค้าแจ้งเข้ามา (support tickets ที่ role === "CUSTOMER")
 * @param {{status?: "open"|"resolved"}} params
 */
export function fetchCustomerIssues(params = {}) {
  return fetchSupportTickets("CUSTOMER", params);
}

/**
 * ลูกค้า/พนักงาน ส่งคำถามหรือแจ้งปัญหาถึงทีมงาน (ต้อง login ก่อน)
 * ตรงกับ POST /api/support
 * @param {{subject: string, message: string, type?: string, priority?: string, relatedRef?: string}} data
 */
export function submitSupportTicket(data) {
  return api.post("/api/support", data);
}

/**
 * ดึงรายละเอียดออเดอร์เดี่ยว (สำหรับ modal ดูรายละเอียดออเดอร์)
 * ตรงกับ GET /api/orders/:id — ต้องเป็น EMPLOYEE/ADMIN หรือเจ้าของออเดอร์เท่านั้น
 */
export async function fetchOrderById(id) {
  const data = await api.get(`/api/orders/${id}`);
  return data.order;
}

/**
 * ดึงรายละเอียดผู้ใช้เดี่ยว (สำหรับ modal ดูรายละเอียดลูกค้า)
 * ตรงกับ GET /api/users/:id — เข้าถึงได้เฉพาะ role ADMIN เท่านั้น (ไม่ใช่ EMPLOYEE)
 */
export async function fetchUserById(id) {
  const data = await api.get(`/api/users/${id}`);
  return data.user;
}

/**
 * เปลี่ยนสถานะตั๋ว support (เฉพาะ role ADMIN เท่านั้นตาม routes/support.js)
 * ตรงกับ PUT /api/support/:id
 * @param {string} id เช่น "SP-1042"
 * @param {"open"|"resolved"} status
 */
export async function updateSupportTicketStatus(id, status) {
  const data = await api.put(`/api/support/${id}`, { status });
  return data.ticket;
}