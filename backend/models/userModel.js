// models/userModel.js
// พอร์ตมาจาก frontend/src/data/userStore.js ให้ทำงานฝั่ง server แทน localStorage

const db = require("../utils/db");

const SEED = require("../data/users.seed.json");

const THAI_MONTHS = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

function formatThaiDate(date = new Date()) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = THAI_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

function getUsers() {
  return db.read("users", SEED);
}

function saveUsers(users) {
  return db.write("users", users);
}

function getUserById(id) {
  return getUsers().find((u) => u.id === Number(id)) || null;
}

function findUserByEmail(email) {
  const target = email.trim().toLowerCase();
  return getUsers().find((u) => u.email.toLowerCase() === target) || null;
}

function addUser(data) {
  const users = getUsers();
  const id = db.nextId(users);
  const now = new Date();
  const newUser = {
    id,
    name: data.name.trim(),
    email: data.email.trim(),
    phone: data.phone?.trim() || "",
    password: data.password || "password123",
    role: data.role || "CUSTOMER",
    status: data.status || "active",
    joined: formatThaiDate(now),
    createdAt: now.toISOString(),
    avatar: data.avatar?.trim() || `https://i.pravatar.cc/64?img=${(id % 70) + 1}`,
  };
  saveUsers([newUser, ...users]);
  return newUser;
}

function updateUserStatus(id, status) {
  const users = getUsers().map((u) => (u.id === Number(id) ? { ...u, status } : u));
  saveUsers(users);
  return users.find((u) => u.id === Number(id)) || null;
}

function updateUser(id, patch) {
  const users = getUsers().map((u) => (u.id === Number(id) ? { ...u, ...patch, id: u.id } : u));
  saveUsers(users);
  return users.find((u) => u.id === Number(id)) || null;
}

function deleteUser(id) {
  const users = getUsers().filter((u) => u.id !== Number(id));
  saveUsers(users);
  return users;
}

/** @throws {Error} ถ้าบัญชีถูกระงับ */
function authenticate(email, password) {
  const user = findUserByEmail(email);
  if (!user || user.password !== password) return null;
  if (user.status === "suspended") {
    throw new Error("บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ");
  }
  return user;
}

/** @throws {Error} ถ้าอีเมลถูกใช้แล้ว */
/** @throws {Error} ถ้าอีเมลถูกใช้แล้ว */
function registerUser({ name, email, phone, password }) {
  const users = getUsers();
  const normalizedEmail = email.trim().toLowerCase();

  if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    throw new Error("อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น");
  }

  const id = db.nextId(users);
  const now = new Date();

  const newUser = {
    id,
    name: name.trim(),
    email: email.trim(),
    phone: phone?.trim() || "",
    password,
    role: "CUSTOMER",
    status: "active",
    joined: formatThaiDate(now),
    createdAt: now.toISOString(),
    avatar: `https://i.pravatar.cc/64?img=${(id % 70) + 1}`,
  };

  saveUsers([newUser, ...users]);
  return newUser;
}

module.exports = {
  getUsers,
  saveUsers,
  getUserById,
  findUserByEmail,
  addUser,
  updateUserStatus,
  updateUser,
  deleteUser,
  authenticate,
  registerUser,
  formatThaiDate,
};
