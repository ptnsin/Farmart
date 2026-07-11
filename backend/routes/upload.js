// routes/upload.js
// จัดการอัปโหลดไฟล์รูป/สลิป แล้วเซฟลงโฟลเดอร์จริงใน backend/uploads/<ประเภท>/
// ทำงานคู่กับโฟลเดอร์ uploads/avatars, uploads/products, uploads/promotions, uploads/payment-slips ที่มีอยู่แล้ว

const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const UPLOADS_ROOT = path.join(__dirname, "..", "uploads");

// ประเภทไฟล์ที่รองรับ — เพิ่ม/แก้ประเภทใหม่ได้ที่นี่ที่เดียว
const UPLOAD_TYPES = {
  avatar: {
    folder: "avatars",
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  },
  product: {
    folder: "products",
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  },
  promotion: {
    folder: "promotions",
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  },
  "payment-slip": {
    folder: "payment-slips",
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
  },
};

// สร้างโฟลเดอร์เก็บไฟล์ของทุกประเภทไว้ล่วงหน้า เผื่อยังไม่มี
for (const { folder } of Object.values(UPLOAD_TYPES)) {
  fs.mkdirSync(path.join(UPLOADS_ROOT, folder), { recursive: true });
}

/** สร้าง multer middleware สำหรับ upload type ที่ระบุ */
function createUploader(type) {
  const config = UPLOAD_TYPES[type];
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(UPLOADS_ROOT, config.folder)),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname) || "";
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, unique);
    },
  });

  return multer({
    storage,
    limits: { fileSize: config.maxSize },
    fileFilter: (req, file, cb) => {
      if (!config.allowedTypes.includes(file.mimetype)) {
        return cb(new Error(`ไฟล์ประเภท "${file.mimetype}" ไม่ได้รับอนุญาตสำหรับ ${type}`));
      }
      cb(null, true);
    },
  });
}

// POST /api/upload/:type  (field name = "file")
// เช่น POST /api/upload/avatar, POST /api/upload/product,
//      POST /api/upload/promotion, POST /api/upload/payment-slip
router.post("/:type", (req, res) => {
  const { type } = req.params;
  const config = UPLOAD_TYPES[type];

  if (!config) {
    return res.status(400).json({
      error: `ไม่รู้จักประเภทการอัปโหลด "${type}" (รองรับ: ${Object.keys(UPLOAD_TYPES).join(", ")})`,
    });
  }

  const upload = createUploader(type);
  upload.single("file")(req, res, (err) => {
    if (err) {
      const message =
        err.code === "LIMIT_FILE_SIZE"
          ? `ขนาดไฟล์ต้องไม่เกิน ${config.maxSize / 1024 / 1024}MB`
          : err.message;
      return res.status(400).json({ error: message });
    }
    if (!req.file) {
      return res.status(400).json({ error: "ไม่พบไฟล์ที่อัปโหลด" });
    }
    const url = `${req.protocol}://${req.get("host")}/uploads/${config.folder}/${req.file.filename}`;
    res.json({ url, filename: req.file.filename, type });
  });
});

// DELETE /api/upload/:type/:filename
router.delete("/:type/:filename", (req, res) => {
  const { type, filename } = req.params;
  const config = UPLOAD_TYPES[type];

  if (!config) {
    return res.status(400).json({
      error: `ไม่รู้จักประเภทการอัปโหลด "${type}" (รองรับ: ${Object.keys(UPLOAD_TYPES).join(", ")})`,
    });
  }

  const filePath = path.join(UPLOADS_ROOT, config.folder, path.basename(filename));
  fs.unlink(filePath, (err) => {
    if (err && err.code !== "ENOENT") {
      return res.status(500).json({ error: "ลบไฟล์ไม่สำเร็จ" });
    }
    res.json({ ok: true });
  });
});

module.exports = router;