// apiClient.js
// ตัวกลางคุยกับ backend (Express API ของเพื่อน) แทนที่ localStorage เดิม
// เก็บ token หลัง login ไว้ใน localStorage (แค่ตัว token สั้น ๆ ไม่ใช่ข้อมูลทั้งระบบเหมือนก่อนหน้า)
// แล้วแนบ header Authorization: Bearer <token> ให้อัตโนมัติทุก request ที่ต้อง login

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const TOKEN_KEY = "farmart_auth_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * เรียก backend API พร้อมแนบ token อัตโนมัติ (ถ้ามี)
 * @param {string} path เช่น "/api/users" หรือ "/api/products/5"
 * @param {RequestInit} options
 */
export async function apiRequest(path, options = {}) {
  const token = getToken();
  const headers = { ...(options.headers || {}) };

  // ถ้า body เป็น object ธรรมดา (ไม่ใช่ FormData) ให้แปลงเป็น JSON เอง
  let body = options.body;
  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(body);
  }
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers, body });
  } catch {
    throw new Error(`เชื่อมต่อ backend ไม่ได้ ตรวจสอบว่ารัน server ที่ ${API_URL} อยู่หรือไม่`);
  }

  // 204 No Content หรือ response ว่าง
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    if (res.status === 401) clearToken();
    throw new Error(data?.error || `เกิดข้อผิดพลาด (HTTP ${res.status})`);
  }
  return data;
}

export const api = {
  get: (path) => apiRequest(path, { method: "GET" }),
  post: (path, body) => apiRequest(path, { method: "POST", body }),
  put: (path, body) => apiRequest(path, { method: "PUT", body }),
  patch: (path, body) => apiRequest(path, { method: "PATCH", body }),
  delete: (path) => apiRequest(path, { method: "DELETE" }),
};

export { API_URL };