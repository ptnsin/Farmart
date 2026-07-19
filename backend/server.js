// server.js
// Farmart Backend - Online Agricultural Equipment Store System
// Express API server ที่ทำหน้าที่แทน localStorage เดิมของฝั่ง frontend
// เก็บข้อมูลแบบไฟล์ JSON (backend/data/*.json) ตามที่ระบุใน README ว่า Database: Local Storage

const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const productRoutes = require("./routes/products");
const categoryRoutes = require("./routes/categories");
const orderRoutes = require("./routes/orders");
const shipmentRoutes = require("./routes/shipments");
const promotionRoutes = require("./routes/promotions");
const supportRoutes = require("./routes/support");
const reportRoutes = require("./routes/reports");
const dashboardRoutes = require("./routes/dashboard");
const uploadRoutes = require("./routes/upload");
const addressRoutes = require("./routes/address");

const app = express();
const PORT = process.env.PORT || 4000;

// origin ของ frontend ที่อนุญาตให้เรียก API พร้อม cookie/session (credentials)
// หมายเหตุ: ต้องระบุ origin แบบเจาะจง ใช้ wildcard '*' ร่วมกับ credentials:true ไม่ได้ตาม CORS spec
const ALLOWED_ORIGINS = [
  "http://localhost:5173", // Vite dev server (frontend)
];

app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    credentials: true,
  })
);
app.use(express.json());

// เปิดให้เข้าถึงไฟล์ที่อัปโหลดแล้วผ่าน URL เช่น
// http://localhost:4000/uploads/avatars/xxx.jpg
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Log แบบง่าย ๆ ไว้ดูตอน dev
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "farmart-backend", time: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/shipments", shipmentRoutes);
app.use("/api/promotions", promotionRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/addresses", addressRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ error: `ไม่พบ endpoint: ${req.method} ${req.originalUrl}` });
});

// Error handler กลาง
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "เกิดข้อผิดพลาดบางอย่างในระบบ กรุณาลองใหม่อีกครั้ง" });
});

app.listen(PORT, () => {
  console.log(`🌾 Farmart backend running at http://localhost:${PORT}`);
});