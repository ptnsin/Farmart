// routes/users.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { requireRole } = require("../middleware/auth");

// ทุก endpoint ของผู้ใช้งานจำกัดสิทธิ์เฉพาะ ADMIN เท่านั้น
router.get("/", requireRole("ADMIN"), userController.getUsers);
router.get("/:id", requireRole("ADMIN"), userController.getUserById);
router.post("/", requireRole("ADMIN"), userController.createUser);
router.put("/:id", requireRole("ADMIN"), userController.updateUser);
router.delete("/:id", requireRole("ADMIN"), userController.deleteUser);

module.exports = router;
