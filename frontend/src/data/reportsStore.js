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
 * ดึงรายการปัญหาที่พนักงานแจ้งเข้ามา (support tickets ที่ role === "EMPLOYEE")
 * ตรงกับ GET /api/support?role=EMPLOYEE
 * @param {{status?: "open"|"resolved", type?: "delivery"|"stock"|"system", priority?: "high"|"medium"|"low"}} params
 */
export async function fetchEmployeeIssues(params = {}) {
  const query = new URLSearchParams({
    role: "EMPLOYEE",
    ...Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== "")),
  }).toString();
  return api.get(`/api/support?${query}`);
}