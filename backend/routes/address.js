// routes/address.js
// ไฟล์เดียวจบ: อ่าน/เขียนข้อมูล + ตรวจสิทธิ์ + กำหนด route ทั้งหมดสำหรับสมุดที่อยู่
// ใช้คู่กับ data/addresses.json (ไฟล์ json เก็บข้อมูลจริง) และ middleware/auth.js ที่มีอยู่แล้ว

const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

// middleware/auth.js export เป็น object ที่มีหลายฟังก์ชัน (requireAuth, requireRole, optionalAuth, ...)
// ต้อง destructure เอา requireAuth ออกมา จะได้ req.user = { id, name, ... } (ไม่มี password) ให้ใช้
const { requireAuth } = require("../middleware/auth");

const DATA_PATH = path.join(__dirname, "..", "data", "addresses.json");

// ---------- อ่าน/เขียนไฟล์ json ----------

function readAll() {
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(raw);
}

function writeAll(addresses) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(addresses, null, 2), "utf-8");
}

function generateId() {
  return "addr_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// ---------- GET /api/addresses ----------
// ดึงที่อยู่ทั้งหมดของผู้ใช้ที่ login อยู่
router.get("/", requireAuth, (req, res) => {
  const ownerId = req.user?.id;
  if (!ownerId) return res.status(401).json({ message: "กรุณาเข้าสู่ระบบก่อน" });

  const addresses = readAll().filter((a) => a.ownerId === ownerId);
  res.json(addresses);
});

// ---------- POST /api/addresses ----------
// เพิ่มที่อยู่ใหม่ (ownerId/ownerName มาจาก token เท่านั้น ไม่รับจาก client)
router.post("/", requireAuth, (req, res) => {
  const ownerId = req.user?.id;
  const ownerName = req.user?.name;
  if (!ownerId) return res.status(401).json({ message: "กรุณาเข้าสู่ระบบก่อน" });

  const { label, recipientName, phone, addressLine, subdistrict, district, province, postalCode } = req.body;

  if (!recipientName || !phone || !addressLine || !subdistrict || !district || !province || !postalCode) {
    return res.status(400).json({ message: "กรุณากรอกข้อมูลที่อยู่ให้ครบถ้วน" });
  }

  const addresses = readAll();
  const isFirstForOwner = !addresses.some((a) => a.ownerId === ownerId);

  const newAddress = {
    id: generateId(),
    ownerId,
    ownerName,
    label,
    recipientName,
    phone,
    addressLine,
    subdistrict,
    district,
    province,
    postalCode,
    isDefault: isFirstForOwner, // ที่อยู่แรกของ owner นี้ ให้เป็นค่าเริ่มต้นอัตโนมัติ
    createdAt: new Date().toISOString(),
  };

  addresses.push(newAddress);
  writeAll(addresses);
  res.status(201).json(newAddress);
});

// ---------- PUT /api/addresses/:id ----------
// แก้ไขข้อมูลที่อยู่ที่มีอยู่แล้ว (label, recipientName, phone, addressLine,
// subdistrict, district, province, postalCode) — ไม่แตะ isDefault ตรงนี้
// (ใช้ PATCH /:id/default แยกต่างหากสำหรับตั้งค่าเริ่มต้น)
router.put("/:id", requireAuth, (req, res) => {
  const ownerId = req.user?.id;
  if (!ownerId) return res.status(401).json({ message: "กรุณาเข้าสู่ระบบก่อน" });

  const { label, recipientName, phone, addressLine, subdistrict, district, province, postalCode } = req.body;

  if (!recipientName || !phone || !addressLine || !subdistrict || !district || !province || !postalCode) {
    return res.status(400).json({ message: "กรุณากรอกข้อมูลที่อยู่ให้ครบถ้วน" });
  }

  const addresses = readAll();
  const target = addresses.find((a) => a.id === req.params.id && a.ownerId === ownerId);
  if (!target) return res.status(404).json({ message: "ไม่พบที่อยู่นี้" });

  const updated = addresses.map((a) =>
    a.id === req.params.id
      ? { ...a, label, recipientName, phone, addressLine, subdistrict, district, province, postalCode }
      : a
  );
  writeAll(updated);
  res.json(updated.find((a) => a.id === req.params.id));
});

// ---------- DELETE /api/addresses/:id ----------
router.delete("/:id", requireAuth, (req, res) => {
  const ownerId = req.user?.id;
  if (!ownerId) return res.status(401).json({ message: "กรุณาเข้าสู่ระบบก่อน" });

  const addresses = readAll();
  const target = addresses.find((a) => a.id === req.params.id && a.ownerId === ownerId);
  if (!target) return res.status(404).json({ message: "ไม่พบที่อยู่นี้" });

  writeAll(addresses.filter((a) => a.id !== req.params.id));
  res.json({ message: "ลบที่อยู่แล้ว", address: target });
});

// ---------- PATCH /api/addresses/:id/default ----------
// ตั้งที่อยู่หนึ่งรายการให้เป็นค่าเริ่มต้น (มีได้ทีละ 1 รายการต่อ owner)
router.patch("/:id/default", requireAuth, (req, res) => {
  const ownerId = req.user?.id;
  if (!ownerId) return res.status(401).json({ message: "กรุณาเข้าสู่ระบบก่อน" });

  const addresses = readAll();
  const target = addresses.find((a) => a.id === req.params.id && a.ownerId === ownerId);
  if (!target) return res.status(404).json({ message: "ไม่พบที่อยู่นี้" });

  const updated = addresses.map((a) =>
    a.ownerId === ownerId ? { ...a, isDefault: a.id === req.params.id } : a
  );
  writeAll(updated);
  res.json(updated.find((a) => a.id === req.params.id));
});

module.exports = router;

// วิธีผูกเข้ากับแอปหลัก (server.js หรือ app.js):
//
//   const addressRoutes = require("./routes/address");
//   app.use("/api/addresses", addressRoutes);