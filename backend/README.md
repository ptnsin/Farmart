# Farmart Backend (Upload Server)

Backend เล็ก ๆ (Node.js + Express.js) ใช้แค่รับไฟล์รูปแล้วเซฟลงโฟลเดอร์จริงบนเครื่อง
ข้อมูลอื่น ๆ ของระบบ (ผู้ใช้, สินค้า, ออเดอร์ ฯลฯ) ยังคงเก็บใน **Local Storage** ฝั่ง frontend
ตามที่ระบุไว้ในสแต็กของโปรเจกต์ — backend นี้ไม่มี database ทำหน้าที่แค่จัดการไฟล์เท่านั้น

ฝั่ง frontend จะเก็บแค่ **URL ของรูป** (เช่น `http://localhost:4000/uploads/products/xxx.jpg`)
ไว้ใน localStorage แทนการเก็บรูปทั้งไฟล์เป็น base64

## วิธีติดตั้งและรัน

```bash
cd backend
npm install
npm run dev      # ใช้ nodemon รีสตาร์ทอัตโนมัติเวลาแก้โค้ด
# หรือ
npm start        # รันแบบปกติ
```

เซิร์ฟเวอร์จะรันที่ `http://localhost:4000`

## ประเภทไฟล์ที่รองรับ

| type | โฟลเดอร์เก็บไฟล์ | ขนาดสูงสุด | ชนิดไฟล์ที่รับ |
|---|---|---|---|
| `avatar` | `uploads/avatars/` | 2MB | JPG, PNG, WEBP, GIF |
| `product` | `uploads/products/` | 5MB | JPG, PNG, WEBP, GIF |
| `promotion` | `uploads/promotions/` | 5MB | JPG, PNG, WEBP, GIF |
| `payment-slip` | `uploads/payment-slips/` | 5MB | JPG, PNG, WEBP, PDF |

เพิ่มประเภทใหม่ได้ง่าย ๆ โดยแก้ที่ object `UPLOAD_TYPES` ในไฟล์ `server.js` ที่เดียว

## Endpoints

| Method | Path | คำอธิบาย |
|---|---|---|
| GET | `/api/health` | เช็คว่าเซิร์ฟเวอร์ทำงานอยู่ |
| POST | `/api/upload/:type` | อัปโหลดไฟล์ (multipart/form-data, field name = `file`) โดย `:type` คือหนึ่งใน `avatar`, `product`, `promotion`, `payment-slip` — คืนค่า `{ url, filename, type }` |
| DELETE | `/api/upload/:type/:filename` | ลบไฟล์ที่เคยอัปโหลดไว้ตามประเภทนั้น ๆ |

### ตัวอย่างการเรียกใช้จาก frontend

```javascript
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function uploadImage(file, type) {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch(`${API_URL}/api/upload/${type}`, { method: "POST", body });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "อัปโหลดไม่สำเร็จ");
  return data.url; // เก็บ url นี้ไว้ใน localStorage แทนตัวไฟล์
}

// ตัวอย่างใช้งาน
await uploadImage(avatarFile, "avatar");
await uploadImage(productImageFile, "product");
await uploadImage(bannerFile, "promotion");
await uploadImage(slipFile, "payment-slip");
```

## หมายเหตุ
- รูปที่อัปโหลดจะถูกเก็บไว้ที่ `backend/uploads/<ประเภท>/` จริง ๆ บนดิสก์ ไม่ใช่ base64
- ต้องรัน backend นี้คู่กับ `frontend` (Vite dev server) พร้อมกันเสมอ ไม่งั้นอัปโหลดรูปจะไม่ทำงาน
- ถ้าจะ deploy ขึ้นจริง ควรเปลี่ยนที่เก็บไฟล์เป็น cloud storage (เช่น S3, Cloudinary) แทนดิสก์ของเซิร์ฟเวอร์ เพราะดิสก์ของ hosting ส่วนใหญ่ไม่ persistent ระหว่าง deploy