// routes/users.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { requireRole } = require("../middleware/auth");

// ทุก endpoint ของผู้ใช้งานจำกัดสิทธิ์เฉพาะ ADMIN เท่านั้น
// ยกเว้น GET /:id ที่เปิดให้ EMPLOYEE เรียกได้ด้วย เพราะหน้า EmployeeOrders.jsx
// ต้องใช้ endpoint นี้ดึงข้อมูล (เช่น avatar, ชื่อ) ของลูกค้าเจ้าของออเดอร์มาแสดง
router.get("/", requireRole("ADMIN"), userController.getUsers);
router.get("/:id", requireRole("ADMIN", "EMPLOYEE"), userController.getUserById);
router.post("/", requireRole("ADMIN"), userController.createUser);
router.put("/:id", requireRole("ADMIN"), userController.updateUser);
router.delete("/:id", requireRole("ADMIN"), userController.deleteUser);

module.exports = router;
