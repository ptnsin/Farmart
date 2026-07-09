// utils/db.js
// เก็บข้อมูลแบบไฟล์ JSON บนฝั่ง server (Local Storage ตามที่ระบุใน README)
// แต่ละ "ตาราง" คือไฟล์ .json หนึ่งไฟล์ใน backend/data
// วิธีนี้ทำให้ backend มี state คงอยู่ข้าม restart โดยไม่ต้องใช้ฐานข้อมูลจริง

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function filePath(name) {
  return path.join(DATA_DIR, `${name}.json`);
}

/** อ่านข้อมูลทั้งหมดจากไฟล์ ถ้าไม่มีไฟล์จะสร้างด้วยค่า seed ที่ส่งเข้ามา */
function read(name, seed = []) {
  const fp = filePath(name);
  if (!fs.existsSync(fp)) {
    write(name, seed);
    return JSON.parse(JSON.stringify(seed));
  }
  try {
    const raw = fs.readFileSync(fp, "utf-8");
    return raw ? JSON.parse(raw) : seed;
  } catch (err) {
    console.error(`[db] failed to read ${name}.json, falling back to seed`, err);
    return JSON.parse(JSON.stringify(seed));
  }
}

/** เขียนทับข้อมูลทั้งหมดลงไฟล์ */
function write(name, data) {
  fs.writeFileSync(filePath(name), JSON.stringify(data, null, 2), "utf-8");
  return data;
}

/** หา id ถัดไปจาก array ของ object ที่มี field id เป็นตัวเลข */
function nextId(records) {
  return records.reduce((max, r) => Math.max(max, Number(r.id) || 0), 0) + 1;
}

module.exports = { read, write, nextId, DATA_DIR };
