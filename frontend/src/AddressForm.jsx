// src/components/AddressForm.jsx
// ฟอร์ม "เพิ่มที่อยู่ใหม่" พร้อมช่อง ตำบล/แขวง ที่ค้นหาแบบ autocomplete
// เลือกตำบลแล้ว อำเภอ/เขต, จังหวัด, รหัสไปรษณีย์ จะเติมให้อัตโนมัติทันที
//
// ใช้คู่กับ:
//   - src/data/thaiGeography.js   (ข้อมูลอ้างอิงตำบล/อำเภอ/จังหวัด/รหัสไปรษณีย์ทั้งประเทศ)
//   - src/data/apiClient.js       (เรียก backend เพื่อบันทึกที่อยู่จริง)

import { useState, useRef, useEffect } from "react";
import { THAI_ADDRESS } from "../data/thaiGeography";
import apiClient from "../data/apiClient";

// ค้นหาตำบลที่ตรงกับคำค้น (จำกัดผลลัพธ์ไม่ให้ยาวเกินไป เพราะบางชื่อซ้ำกันทั่วประเทศ)
function searchSubdistrict(query, limit = 8) {
  const q = query.trim();
  if (!q) return [];
  return THAI_ADDRESS.filter((row) => row.subdistrict.includes(q)).slice(0, limit);
}

export default function AddressForm({ ownerId, ownerName, onSaved, onCancel }) {
  const [form, setForm] = useState({
    label: "",
    recipientName: "",
    phone: "",
    addressLine: "",
    subdistrict: "",
    district: "",
    province: "",
    postalCode: "",
  });

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const wrapRef = useRef(null);

  // ปิด dropdown เมื่อคลิกข้างนอก
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // พิมพ์ในช่องตำบล -> ค้นหาและแสดงตัวเลือก
  function handleSubdistrictInput(value) {
    setForm((prev) => ({
      ...prev,
      subdistrict: value,
      // ล้างค่าที่เคยเติมอัตโนมัติไว้ ถ้าผู้ใช้แก้ตำบลใหม่โดยยังไม่ได้เลือกจากลิสต์
      district: "",
      province: "",
      postalCode: "",
    }));
    setSuggestions(searchSubdistrict(value));
    setShowSuggestions(true);
  }

  // เลือกตำบลจากลิสต์ -> เติมอำเภอ/จังหวัด/รหัสไปรษณีย์ให้อัตโนมัติ
  function handleSelectSuggestion(row) {
    setForm((prev) => ({
      ...prev,
      subdistrict: row.subdistrict,
      district: row.district,
      province: row.province,
      postalCode: row.postalCode,
    }));
    setShowSuggestions(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.recipientName || !form.phone || !form.addressLine) {
      setError("กรุณากรอกชื่อผู้รับ เบอร์โทรศัพท์ และที่อยู่ให้ครบ");
      return;
    }
    // บังคับให้ผู้ใช้เลือกตำบลจากลิสต์เท่านั้น เพื่อให้อำเภอ/จังหวัด/รหัสไปรษณีย์ตรงกันเสมอ
    if (!form.district || !form.province || !form.postalCode) {
      setError("กรุณาเลือกตำบล/แขวงจากรายการที่แนะนำ เพื่อให้ระบบเติมอำเภอ จังหวัด และรหัสไปรษณีย์ให้อัตโนมัติ");
      return;
    }

    setSaving(true);
    try {
      // เรียก backend จริง: POST /api/addresses
      // ownerId / ownerName ไม่ต้องส่งจาก client ก็ได้ ถ้า backend ดึงจาก token ผู้ใช้ที่ login อยู่แล้ว
      const saved = await apiClient.post("/api/addresses", {
        ownerId,
        ownerName,
        ...form,
      });
      onSaved?.(saved);
      setForm({
        label: "",
        recipientName: "",
        phone: "",
        addressLine: "",
        subdistrict: "",
        district: "",
        province: "",
        postalCode: "",
      });
    } catch (err) {
      setError("บันทึกที่อยู่ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="address-form">
      <div className="address-form__row">
        <input
          type="text"
          placeholder="ชื่อป้ายกำกับ (เช่น บ้าน, ที่ทำงาน)"
          value={form.label}
          onChange={(e) => handleField("label", e.target.value)}
        />
        <input
          type="text"
          placeholder="ชื่อผู้รับ"
          value={form.recipientName}
          onChange={(e) => handleField("recipientName", e.target.value)}
        />
      </div>

      <input
        type="tel"
        placeholder="เบอร์โทรศัพท์"
        value={form.phone}
        onChange={(e) => handleField("phone", e.target.value)}
      />

      <input
        type="text"
        placeholder="ที่อยู่ (บ้านเลขที่ ถนน ซอย)"
        value={form.addressLine}
        onChange={(e) => handleField("addressLine", e.target.value)}
      />

      <div className="address-form__autocomplete" ref={wrapRef}>
        <input
          type="text"
          placeholder="พิมพ์ค้นหา ตำบล/แขวง"
          autoComplete="off"
          value={form.subdistrict}
          onChange={(e) => handleSubdistrictInput(e.target.value)}
          onFocus={() => form.subdistrict && setShowSuggestions(true)}
        />
        {showSuggestions && suggestions.length > 0 && (
          <ul className="address-form__suggestions">
            {suggestions.map((row, i) => (
              <li key={i} onClick={() => handleSelectSuggestion(row)}>
                <strong>{row.subdistrict}</strong>
                <span> — {row.district}, {row.province} {row.postalCode}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="address-form__row address-form__row--three">
        <input type="text" placeholder="เขต/อำเภอ" value={form.district} readOnly />
        <input type="text" placeholder="จังหวัด" value={form.province} readOnly />
        <input type="text" placeholder="รหัสไปรษณีย์" value={form.postalCode} readOnly />
      </div>

      {error && <p className="address-form__error">{error}</p>}

      <div className="address-form__actions">
        <button type="button" onClick={onCancel}>ยกเลิก</button>
        <button type="submit" disabled={saving}>
          {saving ? "กำลังบันทึก..." : "บันทึกที่อยู่"}
        </button>
      </div>
    </form>
  );
}
