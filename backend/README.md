# Farmart Backend

Backend API สำหรับ **Farmart – Online Agricultural Equipment Store System** (CSI204)

สร้างด้วย Node.js + Express ตามที่ระบุใน README ของโปรเจกต์ (Backend: Node.js/Express.js, Database: Local Storage)
ในฝั่ง server "Local Storage" ถูกตีความเป็นไฟล์ JSON ที่เก็บอยู่ในโฟลเดอร์ `data/` แทนการใช้ localStorage ของเบราว์เซอร์
(ซึ่งเดิมทำงานอยู่ในไฟล์ `frontend/src/data/productStore.js` และ `userStore.js`) — ตอนนี้ตรรกะเดียวกันถูกย้ายมาไว้ที่ server
เพื่อให้ข้อมูลใช้ร่วมกันได้ระหว่างผู้ใช้หลายคน/หลายเครื่อง

## เริ่มต้นใช้งาน

```bash
cd backend
npm install
npm start        # หรือ npm run dev (auto-restart เมื่อแก้โค้ด)
```

Server จะรันที่ `http://localhost:4000` (เปลี่ยน port ได้ด้วย env `PORT`)

ครั้งแรกที่รัน ระบบจะสร้างไฟล์ข้อมูลเริ่มต้นให้อัตโนมัติในโฟลเดอร์ `data/` จากไฟล์ seed
(`products.seed.json`, `users.seed.json`, ...) — แก้ไขข้อมูลผ่าน API ปกติ ไม่ต้องแก้ไฟล์ seed โดยตรง

## เชื่อมกับ Frontend (Vite + React)

ตั้งค่า base URL ของ API ในฝั่ง frontend เช่น สร้างไฟล์ `frontend/.env`:

```
VITE_API_URL=http://localhost:4000/api
```

แล้วเรียกใช้ผ่าน `fetch(`${import.meta.env.VITE_API_URL}/products`)` แทนการเรียก `getProducts()` จาก `productStore.js` เดิม
ทุก request ที่ต้อง login ให้แนบ header `Authorization: Bearer <token>` (token ได้จาก response ของ `/auth/login` หรือ `/auth/register`)

## บัญชีทดสอบ (seed users, รหัสผ่านทั้งหมดคือ `password123`)

| Email | Role | สถานะ |
|---|---|---|
| kanya.v@email.com | EMPLOYEE | active |
| thanachai.n@email.com | CUSTOMER | suspended (ล็อกอินไม่ได้ ใช้ทดสอบ error) |
| wilailuck.s@email.com | ADMIN | active |
| sombat.p@email.com | EMPLOYEE | active |

## โครงสร้างโปรเจกต์

```
backend/
├── server.js              # จุดเริ่มต้น ตั้งค่า Express + เชื่อม routes
├── routes/                # กำหนด endpoint แต่ละกลุ่ม
├── models/                # ตรรกะจัดการข้อมูล (อ่าน/เขียนไฟล์ JSON)
├── middleware/auth.js      # ระบบ token + requireAuth / requireRole
├── utils/db.js             # ฟังก์ชันอ่าน-เขียนไฟล์ JSON กลาง
└── data/                   # ไฟล์ข้อมูล (seed + runtime, สร้างอัตโนมัติ)
```

## API Endpoints

ทุก endpoint ขึ้นต้นด้วย `/api`

### Auth (`/auth`)
| Method | Path | สิทธิ์ | คำอธิบาย |
|---|---|---|---|
| POST | `/auth/register` | public | สมัครสมาชิก (role เป็น CUSTOMER เสมอ) → คืน token + user |
| POST | `/auth/login` | public | เข้าสู่ระบบ ด้วย email/password → คืน token + user |
| POST | `/auth/logout` | login แล้ว | ลบ token ปัจจุบัน |
| GET | `/auth/me` | login แล้ว | ดูข้อมูลผู้ใช้ปัจจุบันจาก token |

### Users (`/users`) — ผู้ดูแลระบบเท่านั้น (ADMIN)
| Method | Path | คำอธิบาย |
|---|---|---|
| GET | `/users` | รายชื่อผู้ใช้ทั้งหมด |
| GET | `/users/:id` | ข้อมูลผู้ใช้ 1 คน |
| POST | `/users` | เพิ่มผู้ใช้ใหม่ (เช่นพนักงาน) |
| PATCH | `/users/:id/status` | เปลี่ยนสถานะ active/suspended |
| PATCH | `/users/:id` | แก้ไขข้อมูลทั่วไป |
| DELETE | `/users/:id` | ลบผู้ใช้ |

### Products (`/products`)
| Method | Path | สิทธิ์ | คำอธิบาย |
|---|---|---|---|
| GET | `/products` | public | รายการสินค้า รองรับ `?category=` `?search=` |
| GET | `/products/:id` | public | รายละเอียดสินค้า |
| POST | `/products` | EMPLOYEE/ADMIN | เพิ่มสินค้า (ของ EMPLOYEE จะเข้าสถานะ pending รออนุมัติ) |
| PUT | `/products/:id` | EMPLOYEE/ADMIN | แก้ไขสินค้า |
| DELETE | `/products/:id` | EMPLOYEE/ADMIN | ลบสินค้า |
| PATCH | `/products/:id/approval` | ADMIN | อนุมัติ/ปฏิเสธสินค้าที่พนักงานเพิ่ม |
| POST | `/products/:id/reviews` | login แล้ว | ลูกค้าเขียนรีวิว |
| POST | `/products/:id/reviews/:reviewId/reply` | EMPLOYEE/ADMIN | ร้านตอบกลับรีวิว |

### Orders (`/orders`) — ต้อง login
| Method | Path | สิทธิ์ | คำอธิบาย |
|---|---|---|---|
| GET | `/orders` | login แล้ว | ลูกค้าเห็นเฉพาะของตน / staff เห็นทั้งหมด |
| GET | `/orders/:id` | login แล้ว | รายละเอียดคำสั่งซื้อ (ใช้กับหน้า Tracking) |
| POST | `/orders` | login แล้ว | สร้างคำสั่งซื้อ (checkout) |
| PATCH | `/orders/:id/status` | EMPLOYEE/ADMIN | pending / approved / rejected |
| PATCH | `/orders/:id/advance` | EMPLOYEE/ADMIN | เลื่อนสถานะการจัดส่งไปขั้นถัดไป |

### Shipments (`/shipments`) — EMPLOYEE/ADMIN
| Method | Path | คำอธิบาย |
|---|---|---|
| GET | `/shipments` | รายการจัดส่งทั้งหมด |
| POST | `/shipments` | สร้างการจัดส่งใหม่ |
| PATCH | `/shipments/:id/advance` | preparing → in_transit → delivered |

### Promotions (`/promotions`)
| Method | Path | สิทธิ์ | คำอธิบาย |
|---|---|---|---|
| GET | `/promotions` | public | รายการโปรโมชั่นทั้งหมด |
| GET | `/promotions/check/:code` | public | ตรวจโค้ดส่วนลดตอน checkout |
| POST | `/promotions` | ADMIN | เพิ่มโปรโมชั่น |
| PATCH | `/promotions/:id` | ADMIN | แก้ไขโปรโมชั่น |
| PATCH | `/promotions/:id/toggle` | ADMIN | เปิด/ปิดการใช้งาน |
| DELETE | `/promotions/:id` | ADMIN | ลบโปรโมชั่น |

### Support (`/support`)
| Method | Path | สิทธิ์ | คำอธิบาย |
|---|---|---|---|
| GET | `/support` | ADMIN | ตั๋วช่วยเหลือทั้งหมด |
| GET | `/support/mine` | login แล้ว | ตั๋วของตัวเอง |
| POST | `/support` | login แล้ว | ส่งคำถาม/แจ้งปัญหา |
| PATCH | `/support/:id/status` | ADMIN | open / resolved |

### Reports (`/reports`) — EMPLOYEE/ADMIN
| Method | Path | คำอธิบาย |
|---|---|---|
| GET | `/reports/summary` | ยอดขายรวม, จำนวนคำสั่งซื้อ, สินค้าใกล้หมดสต๊อก, สินค้าขายดี 5 อันดับ |

## หมายเหตุ
- นี่คือระบบ authentication แบบง่าย (token สุ่มเก็บใน `data/sessions.json`) เหมาะสำหรับงานเรียน/สาธิต
  ถ้าจะนำไปใช้งานจริงควรเปลี่ยนไปใช้ JWT + hash รหัสผ่านด้วย bcrypt แทนการเก็บ plain text
- CORS เปิดกว้างทุก origin (`cors()`) เพื่อความสะดวกตอนพัฒนา ปรับ config ก่อน deploy จริง
