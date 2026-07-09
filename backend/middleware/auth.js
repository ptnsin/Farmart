// middleware/auth.js
// ระบบยืนยันตัวตนแบบง่าย: หลัง login/register สำเร็จ server จะออก token (random string)
// แล้วเก็บ mapping token -> userId ไว้ใน data/sessions.json
// ฝั่ง frontend ต้องแนบ header: Authorization: Bearer <token> ในทุก request ที่ต้อง login

const crypto = require("crypto");
const db = require("../utils/db");
const { getUsers } = require("../models/userModel");

function createToken(userId) {
  const token = crypto.randomBytes(24).toString("hex");
  const sessions = db.read("sessions", {});
  sessions[token] = { userId, createdAt: new Date().toISOString() };
  db.write("sessions", sessions);
  return token;
}

function destroyToken(token) {
  const sessions = db.read("sessions", {});
  delete sessions[token];
  db.write("sessions", sessions);
}

function getUserFromToken(token) {
  if (!token) return null;
  const sessions = db.read("sessions", {});
  const session = sessions[token];
  if (!session) return null;
  const user = getUsers().find((u) => u.id === session.userId);
  return user || null;
}

/** ดึง token จาก Authorization header ("Bearer xxx") */
function extractToken(req) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  return scheme === "Bearer" ? token : null;
}

/** middleware: ต้อง login เท่านั้น ไม่งั้นตอบ 401 */
function requireAuth(req, res, next) {
  const token = extractToken(req);
  const user = getUserFromToken(token);
  if (!user) {
    return res.status(401).json({ error: "กรุณาเข้าสู่ระบบก่อนใช้งาน" });
  }
  const { password, ...safeUser } = user;
  req.user = safeUser;
  req.token = token;
  next();
}

/** middleware: ต้อง login และมี role อยู่ใน allowedRoles ไม่งั้นตอบ 403 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    requireAuth(req, res, () => {
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: "ไม่มีสิทธิ์เข้าถึงข้อมูลนี้" });
      }
      next();
    });
  };
}

/** middleware: ดึง user ถ้ามี token แต่ไม่บังคับ login (เช่นหน้า products ที่ดูได้ทั้ง guest/member) */
function optionalAuth(req, res, next) {
  const token = extractToken(req);
  const user = getUserFromToken(token);
  if (user) {
    const { password, ...safeUser } = user;
    req.user = safeUser;
  }
  next();
}

module.exports = {
  createToken,
  destroyToken,
  getUserFromToken,
  requireAuth,
  requireRole,
  optionalAuth,
};
