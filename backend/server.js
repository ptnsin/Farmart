import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 4000;
const UPLOADS_ROOT = path.join(__dirname, "uploads");

// ประเภทไฟล์ที่ backend รองรับ — เพิ่ม/แก้ประเภทใหม่ได้ที่นี่ที่เดียว
// key คือชื่อที่ใช้ใน URL เช่น POST /api/upload/avatar, POST /api/upload/product
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
    // สลิปบางแบงก์ให้เซฟเป็น PDF ได้ เลยรองรับเผื่อไว้ด้วย
    allowedTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
  },
};

// สร้างโฟลเดอร์เก็บไฟล์ของทุกประเภทไว้ล่วงหน้า เผื่อยังไม่มี
for (const { folder } of Object.values(UPLOAD_TYPES)) {
  fs.mkdirSync(path.join(UPLOADS_ROOT, folder), { recursive: true });
}

const app = express();
app.use(cors());

// เปิดให้เข้าถึงไฟล์ที่อัปโหลดแล้วผ่าน URL เช่น
// http://localhost:4000/uploads/avatars/xxx.jpg
// http://localhost:4000/uploads/products/xxx.jpg
app.use("/uploads", express.static(UPLOADS_ROOT));

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

app.get("/api/health", (req, res) => res.json({ ok: true }));

// รับไฟล์ 1 ไฟล์ ภายใต้ฟิลด์ชื่อ "file" — ใช้ร่วมกันได้ทุกประเภท
// เช่น POST /api/upload/avatar, POST /api/upload/product,
//      POST /api/upload/promotion, POST /api/upload/payment-slip
app.post("/api/upload/:type", (req, res) => {
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
    const url = `http://localhost:${PORT}/uploads/${config.folder}/${req.file.filename}`;
    res.json({ url, filename: req.file.filename, type });
  });
});

// ลบไฟล์ที่เคยอัปโหลดไว้ เช่น DELETE /api/upload/product/xxx.jpg
app.delete("/api/upload/:type/:filename", (req, res) => {
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

app.listen(PORT, () => {
  console.log(`✅ Upload server พร้อมใช้งานที่ http://localhost:${PORT}`);
  console.log(`   ประเภทที่รองรับ: ${Object.keys(UPLOAD_TYPES).join(", ")}`);
  console.log(`   เก็บไฟล์ไว้ที่ ${UPLOADS_ROOT}`);
});