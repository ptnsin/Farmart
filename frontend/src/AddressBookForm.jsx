// src/AddressBookForm.jsx
// ฟอร์มเพิ่ม/แก้ไขที่อยู่ในสมุดที่อยู่ (address book) ใช้ร่วมกันทั้งหน้า Checkout
// และหน้า Profile (แท็บ "ที่อยู่จัดส่ง") เพื่อให้ข้อมูลที่กรอกมี schema เดียวกัน
// แล้วถูกส่งไปเก็บที่ backend (routes/address.js) ที่เดียวกันเสมอ — ก่อนหน้านี้
// หน้า Profile มีฟอร์ม + state ของตัวเองแยกต่างหาก (เก็บแค่ใน memory ไม่ยิง backend)
// ทำให้ที่อยู่ที่กรอกในหน้า Checkout ไม่ไปปรากฏที่หน้า Profile และกลับกัน

import { useState } from "react";
import { X } from "lucide-react";
import { THAI_ADDRESS } from "./data/thaiGeography";

// รายชื่อจังหวัดทั้งหมด (ไม่ซ้ำ) เรียงตามลำดับตัวอักษรไทย
export const PROVINCES = [...new Set(THAI_ADDRESS.map((r) => r.province))].sort((a, b) =>
  a.localeCompare(b, "th")
);

// รายชื่ออำเภอ/เขตในจังหวัดที่เลือก
export function getDistricts(province) {
  if (!province) return [];
  return [...new Set(THAI_ADDRESS.filter((r) => r.province === province).map((r) => r.district))].sort(
    (a, b) => a.localeCompare(b, "th")
  );
}

// รายชื่อตำบล/แขวงในอำเภอที่เลือก
export function getSubdistricts(province, district) {
  if (!province || !district) return [];
  return THAI_ADDRESS.filter((r) => r.province === province && r.district === district).sort((a, b) =>
    a.subdistrict.localeCompare(b.subdistrict, "th")
  );
}

// จำกัดให้พิมพ์เบอร์โทรได้เฉพาะตัวเลขกับขีด (กันพิมพ์มั่ว)
export function sanitizePhoneInput(raw) {
  return raw.replace(/[^\d-]/g, "").slice(0, 12);
}

// เบอร์มือถือไทย 10 หลัก (0XX-XXX-XXXX) หรือเบอร์บ้าน 9 หลัก (0X-XXX-XXXX)
export function isValidThaiPhone(value) {
  const digits = value.replace(/-/g, "");
  return /^0\d{8,9}$/.test(digits);
}

// addr (schema backend) -> ค่าเริ่มต้นของฟอร์ม (ใช้ตอนแก้ไข)
function toFormValues(addr) {
  if (!addr) {
    return {
      label: "",
      name: "",
      phone: "",
      detail: "",
      province: "",
      district: "",
      subdistrict: "",
      postalCode: "",
    };
  }
  return {
    label: addr.label || "",
    name: addr.recipientName || "",
    phone: addr.phone || "",
    detail: addr.addressLine || "",
    province: addr.province || "",
    district: addr.district || "",
    subdistrict: addr.subdistrict || "",
    postalCode: addr.postalCode || "",
  };
}

// props:
// - initialValues: address ที่กำลังแก้ไข (schema backend) หรือ undefined สำหรับเพิ่มใหม่
// - onCancel, onSave(payload), saving, error
export default function AddressBookForm({ initialValues, onCancel, onSave, saving, error }) {
  const [form, setForm] = useState(() => toFormValues(initialValues));
  const [touched, setTouched] = useState({});

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handlePhoneChange = (e) => {
    setForm((f) => ({ ...f, phone: sanitizePhoneInput(e.target.value) }));
  };

  // เลือกจังหวัด -> ล้างอำเภอ/ตำบล/รหัสไปรษณีย์ที่เคยเลือกไว้ เพราะไม่ตรงกับจังหวัดใหม่แล้ว
  const handleProvinceChange = (e) => {
    setForm((f) => ({
      ...f,
      province: e.target.value,
      district: "",
      subdistrict: "",
      postalCode: "",
    }));
  };

  // เลือกอำเภอ -> ล้างตำบล/รหัสไปรษณีย์
  const handleDistrictChange = (e) => {
    setForm((f) => ({ ...f, district: e.target.value, subdistrict: "", postalCode: "" }));
  };

  // เลือกตำบล -> เติมรหัสไปรษณีย์ให้อัตโนมัติ
  const handleSubdistrictChange = (e) => {
    const subdistrict = e.target.value;
    const match = THAI_ADDRESS.find(
      (r) => r.province === form.province && r.district === form.district && r.subdistrict === subdistrict
    );
    setForm((f) => ({ ...f, subdistrict, postalCode: match?.postalCode || "" }));
  };

  const districts = getDistricts(form.province);
  const subdistricts = getSubdistricts(form.province, form.district);

  const phoneValid = isValidThaiPhone(form.phone);
  const canSave =
    form.name.trim() &&
    phoneValid &&
    form.detail.trim() &&
    form.province &&
    form.district &&
    form.subdistrict &&
    form.postalCode;

  const handleSave = () => {
    // ส่งข้อมูลให้ตรงกับ schema ของ backend (ดู routes/address.js): recipientName, addressLine ฯลฯ
    onSave({
      label: form.label,
      recipientName: form.name,
      phone: form.phone,
      addressLine: form.detail,
      subdistrict: form.subdistrict,
      district: form.district,
      province: form.province,
      postalCode: form.postalCode,
    });
  };

  const selectClass =
    "text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700 bg-white disabled:bg-gray-50 disabled:text-gray-400";
  const inputClass =
    "text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700";

  return (
    <div className="border border-green-200 bg-green-50 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-900">
          {initialValues ? "แก้ไขที่อยู่" : "เพิ่มที่อยู่ใหม่"}
        </p>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          placeholder="ชื่อป้ายกำกับ (เช่น บ้าน, ที่ทำงาน)"
          value={form.label}
          onChange={update("label")}
          className={inputClass}
        />
        <input
          placeholder="ชื่อผู้รับ"
          value={form.name}
          onChange={update("name")}
          className={inputClass}
        />

        <div className="sm:col-span-2">
          <input
            placeholder="เบอร์โทรศัพท์ (เช่น 081-234-5678)"
            inputMode="numeric"
            value={form.phone}
            onChange={handlePhoneChange}
            onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
            className={`w-full ${inputClass} ${
              touched.phone && !phoneValid && form.phone ? "border-red-300 focus:ring-red-400" : ""
            }`}
          />
          {touched.phone && form.phone && !phoneValid && (
            <p className="text-xs text-red-500 mt-1">กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง (ตัวเลข 9-10 หลัก ขึ้นต้นด้วย 0)</p>
          )}
        </div>

        <input
          placeholder="ที่อยู่ (บ้านเลขที่ ถนน ซอย)"
          value={form.detail}
          onChange={update("detail")}
          className={`${inputClass} sm:col-span-2`}
        />

        <select value={form.province} onChange={handleProvinceChange} className={selectClass}>
          <option value="">เลือกจังหวัด</option>
          {PROVINCES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <select
          value={form.district}
          onChange={handleDistrictChange}
          disabled={!form.province}
          className={selectClass}
        >
          <option value="">{form.province ? "เลือกเขต/อำเภอ" : "เลือกจังหวัดก่อน"}</option>
          {districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <select
          value={form.subdistrict}
          onChange={handleSubdistrictChange}
          disabled={!form.district}
          className={selectClass}
        >
          <option value="">{form.district ? "เลือกตำบล/แขวง" : "เลือกเขต/อำเภอก่อน"}</option>
          {subdistricts.map((s) => (
            <option key={s.subdistrict} value={s.subdistrict}>
              {s.subdistrict}
            </option>
          ))}
        </select>

        <input
          placeholder="รหัสไปรษณีย์"
          value={form.postalCode}
          readOnly
          className={`${selectClass} bg-gray-50 text-gray-600`}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex justify-end gap-2 pt-1">
        <button
          onClick={onCancel}
          disabled={saving}
          className="text-sm font-medium text-gray-500 px-4 py-2 rounded-lg hover:bg-white disabled:opacity-40"
        >
          ยกเลิก
        </button>
        <button
          disabled={!canSave || saving}
          onClick={handleSave}
          className="text-sm font-semibold text-white bg-green-800 hover:bg-green-900 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 rounded-lg"
        >
          {saving ? "กำลังบันทึก..." : "บันทึกที่อยู่"}
        </button>
      </div>
    </div>
  );
}