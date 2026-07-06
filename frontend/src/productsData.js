export const CATEGORIES = [
  { key: "seeds", label: "เมล็ดพันธุ์ (Seeds)" },
  { key: "organic", label: "ปุ๋ยอินทรีย์ (Organic)" },
  { key: "tools", label: "เครื่องมือเกษตร (Tools)" },
];

export const ORIGINS = ["เชียงใหม่", "ภาคเหนือ", "น่าน"];

export const PRODUCTS = [
  {
    id: 1,
    name: "เมล็ดพันธุ์ผักสลัดออร์แกนิก",
    category: "seeds",
    tag: "PREMIUM SEEDS",
    badge: { label: "ขายดีที่สุด", tone: "green" },
    price: 250,
    oldPrice: 350,
    origin: "เชียงใหม่",
    rating: 4.9,
    ratingCount: 210,
    image:
      "https://images.pexels.com/photos/7728082/pexels-photo-7728082.jpeg?auto=compress&cs=tinysrgb&w=800",
    gallery: [
      "https://images.pexels.com/photos/7728082/pexels-photo-7728082.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.unsplash.com/photo-1508747703725-719777637510?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=800&auto=format&fit=crop",
    ],
    description:
      "เมล็ดพันธุ์ผักสลัดออร์แกนิกคัดพิเศษ อัตราการงอกสูงกว่า 95% ปลอดสารเคมีตลอดกระบวนการผลิต เหมาะสำหรับปลูกทั้งในแปลงดินและระบบไฮโดรโปนิกส์ ให้ผลผลิตใบสดกรอบ รสชาติหวานกรอบ เก็บเกี่ยวได้ภายใน 30-35 วัน",
    sizes: [
      { label: "ซอง 5 กรัม", price: 250 },
      { label: "ซอง 15 กรัม", price: 620 },
      { label: "ซอง 30 กรัม", price: 1100 },
    ],
    specs: {
      "อัตราการงอก": "95%+",
      "ระยะเก็บเกี่ยว": "30-35 วัน",
      "การรับรอง": "Organic Thailand",
      "บรรจุภัณฑ์": "ซองสูญญากาศกันชื้น",
    },
    care: [
      { title: "การเพาะกล้า", desc: "แช่เมล็ดในน้ำอุ่น 4-6 ชั่วโมงก่อนเพาะ หยอดลึก 0.5 ซม." },
      { title: "การรดน้ำ", desc: "รดน้ำเช้า-เย็น วันละ 2 ครั้ง อย่าให้ดินแฉะเกินไป" },
    ],
  },
  {
    id: 2,
    name: "ปุ๋ยชีวภาพ สูตรพรีเมียม HarvestGold สำหรับพืชผักสวนครัว",
    category: "organic",
    tag: "FERTILIZERS",
    badge: { label: "Organic Certified", tone: "outline" },
    price: 245,
    origin: "เชียงใหม่",
    rating: 4.9,
    ratingCount: 124,
    image:
      "https://images.unsplash.com/photo-1620200423727-8127f75d7f53?q=80&w=800&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1620200423727-8127f75d7f53?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=800&auto=format&fit=crop",
    ],
    description:
      "HarvestGold Premium Organic Fertilizer สูตรเข้มข้นผลิตจากวัตถุดิบธรรมชาติ 100% ผ่านกระบวนการหมักด้วยจุลินทรีย์คุณภาพสูง ช่วยปรับปรุงโครงสร้างดิน เพิ่มธาตุอาหารรองที่จำเป็น เหมาะสำหรับพืชผักสวนครัวทุกชนิด ให้ผลผลิตดก ใบเขียวสมบูรณ์ ไม่ตกค้างสารเคมีในดิน",
    sizes: [
      { label: "เล็ก (500 กรัม)", price: 245 },
      { label: "กลาง (1 กก.)", price: 420 },
      { label: "ใหญ่ (3 กก.)", price: 990 },
    ],
    specs: {
      "ชนิด": "Organic 100%",
      "ธาตุอาหารหลัก N-P-K": "7-6-5",
      "ค่า pH": "6.5 - 7.5",
      "การรับรอง": "PDAM Thailand Organic",
    },
    care: [
      { title: "อัตราการใช้", desc: "ใส่ปุ๋ย 1 ช้อนโต๊ะต่อกระถาง 10 นิ้ว ทุก 15 วัน" },
      { title: "การเก็บรักษา", desc: "เก็บในที่แห้ง พ้นแสงแดด ปิดฝาให้สนิททุกครั้งหลังใช้งาน" },
    ],
  },
  {
    id: 3,
    name: "ชุดเสียมสแตนเลสด้ามไม้โอ๊ค",
    category: "tools",
    tag: "PREMIUM TOOLS",
    badge: { label: "Best Seller", tone: "orange" },
    price: 1290,
    origin: "น่าน",
    rating: 4.9,
    ratingCount: 58,
    image:
      "https://images.unsplash.com/photo-1617576683096-00fc8eecb3af?q=80&w=800&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1617576683096-00fc8eecb3af?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1617396900799-f4ec2b43c7ae?q=80&w=800&auto=format&fit=crop",
    ],
    description:
      "ชุดเครื่องมือทำสวนสแตนเลสเกรดพรีเมียม ด้ามจับไม้โอ๊คแท้ทนทาน จับถนัดมือ ไม่ลื่นแม้มือเปียก เหมาะสำหรับงานพรวนดิน ขุด และตกแต่งกระถางต้นไม้ ผลิตจากสแตนเลสไร้สนิม ใช้งานได้ยาวนาน",
    sizes: [
      { label: "ชุด 3 ชิ้น", price: 1290 },
      { label: "ชุด 5 ชิ้น", price: 1990 },
    ],
    specs: {
      "วัสดุหัว": "สแตนเลส 430",
      "วัสดุด้าม": "ไม้โอ๊คแท้",
      "น้ำหนักรวม": "620 กรัม",
      "การรับประกัน": "1 ปี",
    },
    care: [
      { title: "การดูแล", desc: "เช็ดทำความสะอาดหลังใช้งานทุกครั้ง เก็บในที่แห้ง" },
    ],
  },
  {
    id: 4,
    name: "ดินผสมอินทรียวัตถุ (50L)",
    category: "organic",
    tag: "SOIL & SUBSTRATES",
    price: 180,
    origin: "เชียงใหม่",
    rating: 4.7,
    ratingCount: 140,
    image:
      "https://images.pexels.com/photos/15182672/pexels-photo-15182672.jpeg?auto=compress&cs=tinysrgb&w=800",
    gallery: [
      "https://images.pexels.com/photos/15182672/pexels-photo-15182672.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.unsplash.com/photo-1585123334904-845d60e97b29?q=80&w=800&auto=format&fit=crop",
    ],
    description:
      "ดินผสมสำเร็จรูปคุณภาพสูง ผสมอินทรียวัตถุและมูลไส้เดือนในสัดส่วนที่เหมาะสม ระบายน้ำดี อุ้มความชื้นพอเหมาะ พร้อมปลูกทันทีไม่ต้องผสมเพิ่ม เหมาะสำหรับปลูกผัก ไม้ดอก และไม้กระถางทั่วไป",
    sizes: [
      { label: "ถุง 25L", price: 180 },
      { label: "ถุง 50L", price: 320 },
    ],
    specs: {
      "ส่วนผสม": "ดิน+ปุ๋ยหมัก+แกลบดำ",
      "ค่า pH": "6.0 - 6.8",
      "น้ำหนัก": "50 ลิตร/ถุง",
    },
    care: [
      { title: "การใช้งาน", desc: "ตักดินใส่กระถาง เว้นระยะ 2 ซม. จากขอบกระถางก่อนปลูก" },
    ],
  },
  {
    id: 5,
    name: "เครื่องตั้งเวลาหยดน้ำพลังงานแสงอาทิตย์",
    category: "tools",
    tag: "IRRIGATION",
    badge: { label: "Smart Farming", tone: "green" },
    price: 2450,
    origin: "ภาคเหนือ",
    rating: 4.8,
    ratingCount: 44,
    image:
      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MDAgMzAwIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0ic2t5IiB4MT0iMCIgeTE9IjAiIHgyPSIwIiB5Mj0iMSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNlYWZhZjAiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjZDdmMmUzIi8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogICAgPGxpbmVhckdyYWRpZW50IGlkPSJwYW5lbCIgeDE9IjAiIHkxPSIwIiB4Mj0iMSIgeTI9IjEiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMWUzYThhIi8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzFlMjkzYiIvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CgogIDxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSJ1cmwoI3NreSkiLz4KCiAgPCEtLSBzdW4gLS0+CiAgPGNpcmNsZSBjeD0iMzM1IiBjeT0iNTUiIHI9IjI2IiBmaWxsPSIjZmJiZjI0Ii8+CiAgPGcgc3Ryb2tlPSIjZmJiZjI0IiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCI+CiAgICA8bGluZSB4MT0iMzM1IiB5MT0iMTAiIHgyPSIzMzUiIHkyPSIyMCIvPgogICAgPGxpbmUgeDE9IjMzNSIgeTE9IjkwIiB4Mj0iMzM1IiB5Mj0iMTAwIi8+CiAgICA8bGluZSB4MT0iMjkwIiB5MT0iNTUiIHgyPSIzMDAiIHkyPSI1NSIvPgogICAgPGxpbmUgeDE9IjM3MCIgeTE9IjU1IiB4Mj0iMzgwIiB5Mj0iNTUiLz4KICAgIDxsaW5lIHgxPSIzMDMiIHkxPSIyMyIgeDI9IjMxMCIgeTI9IjMwIi8+CiAgICA8bGluZSB4MT0iMzYwIiB5MT0iODAiIHgyPSIzNjciIHkyPSI4NyIvPgogICAgPGxpbmUgeDE9IjM2NyIgeTE9IjIzIiB4Mj0iMzYwIiB5Mj0iMzAiLz4KICAgIDxsaW5lIHgxPSIzMTAiIHkxPSI4MCIgeDI9IjMwMyIgeTI9Ijg3Ii8+CiAgPC9nPgoKICA8IS0tIGdyb3VuZCAtLT4KICA8cmVjdCB4PSIwIiB5PSIyNDUiIHdpZHRoPSI0MDAiIGhlaWdodD0iNTUiIGZpbGw9IiNjN2E2NzUiLz4KICA8cmVjdCB4PSIwIiB5PSIyNDUiIHdpZHRoPSI0MDAiIGhlaWdodD0iNiIgZmlsbD0iI2E4ODQ1YSIvPgoKICA8IS0tIHNvbGFyIHBhbmVsIG9uIGEgcG9sZSAtLT4KICA8cmVjdCB4PSI1NSIgeT0iMTY1IiB3aWR0aD0iMzQiIGhlaWdodD0iMTQiIHJ4PSIyIiBmaWxsPSIjMTY2NTM0Ii8+CiAgPHJlY3QgeD0iNjYiIHk9IjE3OSIgd2lkdGg9IjEyIiBoZWlnaHQ9IjcwIiBmaWxsPSIjNzg3MTZjIi8+CiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMzUsMTEwKSByb3RhdGUoLTgpIj4KICAgIDxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIxMTAiIGhlaWdodD0iNzAiIHJ4PSI0IiBmaWxsPSJ1cmwoI3BhbmVsKSIgc3Ryb2tlPSIjMGYxNzJhIiBzdHJva2Utd2lkdGg9IjIiLz4KICAgIDxnIHN0cm9rZT0iIzNiODJmNiIgc3Ryb2tlLXdpZHRoPSIyIj4KICAgICAgPGxpbmUgeDE9IjI3LjUiIHkxPSIwIiB4Mj0iMjcuNSIgeTI9IjcwIi8+CiAgICAgIDxsaW5lIHgxPSI1NSIgeTE9IjAiIHgyPSI1NSIgeTI9IjcwIi8+CiAgICAgIDxsaW5lIHgxPSI4Mi41IiB5MT0iMCIgeDI9IjgyLjUiIHkyPSI3MCIvPgogICAgICA8bGluZSB4MT0iMCIgeTE9IjIzIiB4Mj0iMTEwIiB5Mj0iMjMiLz4KICAgICAgPGxpbmUgeDE9IjAiIHkxPSI0NiIgeDI9IjExMCIgeTI9IjQ2Ii8+CiAgICA8L2c+CiAgPC9nPgoKICA8IS0tIGNvbnRyb2xsZXIgLyB0aW1lciBib3ggLS0+CiAgPHJlY3QgeD0iMTUwIiB5PSIxNTAiIHdpZHRoPSI3MCIgaGVpZ2h0PSI5MCIgcng9IjgiIGZpbGw9IiNmZmZmZmYiIHN0cm9rZT0iIzE2NjUzNCIgc3Ryb2tlLXdpZHRoPSIzIi8+CiAgPHJlY3QgeD0iMTYwIiB5PSIxNjIiIHdpZHRoPSI1MCIgaGVpZ2h0PSIyNiIgcng9IjQiIGZpbGw9IiMwZjE3MmEiLz4KICA8dGV4dCB4PSIxODUiIHk9IjE4MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNGFkZTgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj4wODowMDwvdGV4dD4KICA8Y2lyY2xlIGN4PSIxNjciIGN5PSIyMDUiIHI9IjciIGZpbGw9IiMxNjY1MzQiLz4KICA8Y2lyY2xlIGN4PSIxODUiIGN5PSIyMDUiIHI9IjciIGZpbGw9IiMyMmM1NWUiLz4KICA8Y2lyY2xlIGN4PSIyMDMiIGN5PSIyMDUiIHI9IjciIGZpbGw9IiMxNjY1MzQiLz4KICA8cmVjdCB4PSIxNjAiIHk9IjIxOCIgd2lkdGg9IjUwIiBoZWlnaHQ9IjEwIiByeD0iMyIgZmlsbD0iI2RjZmNlNyIvPgogIDxyZWN0IHg9IjE3OCIgeT0iMjQwIiB3aWR0aD0iMTQiIGhlaWdodD0iMTYiIGZpbGw9IiM5NGEzYjgiLz4KCiAgPCEtLSBob3NlIGZyb20gY29udHJvbGxlciBkb3duIHRvIGRyaXAgbGluZSAtLT4KICA8cGF0aCBkPSJNMTg1IDI1NiBDMTg1IDI3MCwgMTUwIDI3MCwgMTUwIDI4NSIgc3Ryb2tlPSIjMTY2NTM0IiBzdHJva2Utd2lkdGg9IjYiIGZpbGw9Im5vbmUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgogIDxwYXRoIGQ9Ik0xNTAgMjg1IEwzNDAgMjg1IiBzdHJva2U9IiMxNjY1MzQiIHN0cm9rZS13aWR0aD0iNiIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CgogIDwhLS0gZHJpcCBlbWl0dGVycyArIHdhdGVyIGRyb3BzICsgc21hbGwgcGxhbnRzIGFsb25nIHRoZSBsaW5lIC0tPgogIDxnPgogICAgPGNpcmNsZSBjeD0iMTkwIiBjeT0iMjg1IiByPSIzIiBmaWxsPSIjMGYxNzJhIi8+CiAgICA8cGF0aCBkPSJNMTkwIDI4OSBxNCA4IDAgMTQgcS00IC02IDAgLTE0IiBmaWxsPSIjMzhiZGY4Ii8+CgogICAgPGNpcmNsZSBjeD0iMjQwIiBjeT0iMjg1IiByPSIzIiBmaWxsPSIjMGYxNzJhIi8+CiAgICA8cGF0aCBkPSJNMjQwIDI4OSBxNCA4IDAgMTQgcS00IC02IDAgLTE0IiBmaWxsPSIjMzhiZGY4Ii8+CgogICAgPGNpcmNsZSBjeD0iMjkwIiBjeT0iMjg1IiByPSIzIiBmaWxsPSIjMGYxNzJhIi8+CiAgICA8cGF0aCBkPSJNMjkwIDI4OSBxNCA4IDAgMTQgcS00IC02IDAgLTE0IiBmaWxsPSIjMzhiZGY4Ii8+CiAgPC9nPgoKICA8IS0tIGxpdHRsZSBwbGFudHMgLS0+CiAgPGcgZmlsbD0iIzIyYzU1ZSI+CiAgICA8cGF0aCBkPSJNMjIwIDI0NSBxLTEwIC0yNSAtMjIgLTI4IHExNCAyIDIyIDE0IHEyIC0xOCAxNiAtMjQgcS0xMCAxNCAtOCAzMiBxLTQgNCAtOCA2eiIvPgogICAgPHBhdGggZD0iTTI3MCAyNDggcS04IC0yMCAtMTggLTIzIHExMSAyIDE4IDExIHEyIC0xNSAxMyAtMjAgcS04IDExIC02IDI2IHEtMyA0IC03IDZ6Ii8+CiAgICA8cGF0aCBkPSJNMzIwIDI0NSBxLTEwIC0yNSAtMjIgLTI4IHExNCAyIDIyIDE0IHEyIC0xOCAxNiAtMjQgcS0xMCAxNCAtOCAzMiBxLTQgNCAtOCA2eiIvPgogIDwvZz4KPC9zdmc+Cg==",
    gallery: [
      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MDAgMzAwIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0ic2t5IiB4MT0iMCIgeTE9IjAiIHgyPSIwIiB5Mj0iMSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNlYWZhZjAiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjZDdmMmUzIi8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogICAgPGxpbmVhckdyYWRpZW50IGlkPSJwYW5lbCIgeDE9IjAiIHkxPSIwIiB4Mj0iMSIgeTI9IjEiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMWUzYThhIi8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzFlMjkzYiIvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CgogIDxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSJ1cmwoI3NreSkiLz4KCiAgPCEtLSBzdW4gLS0+CiAgPGNpcmNsZSBjeD0iMzM1IiBjeT0iNTUiIHI9IjI2IiBmaWxsPSIjZmJiZjI0Ii8+CiAgPGcgc3Ryb2tlPSIjZmJiZjI0IiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCI+CiAgICA8bGluZSB4MT0iMzM1IiB5MT0iMTAiIHgyPSIzMzUiIHkyPSIyMCIvPgogICAgPGxpbmUgeDE9IjMzNSIgeTE9IjkwIiB4Mj0iMzM1IiB5Mj0iMTAwIi8+CiAgICA8bGluZSB4MT0iMjkwIiB5MT0iNTUiIHgyPSIzMDAiIHkyPSI1NSIvPgogICAgPGxpbmUgeDE9IjM3MCIgeTE9IjU1IiB4Mj0iMzgwIiB5Mj0iNTUiLz4KICAgIDxsaW5lIHgxPSIzMDMiIHkxPSIyMyIgeDI9IjMxMCIgeTI9IjMwIi8+CiAgICA8bGluZSB4MT0iMzYwIiB5MT0iODAiIHgyPSIzNjciIHkyPSI4NyIvPgogICAgPGxpbmUgeDE9IjM2NyIgeTE9IjIzIiB4Mj0iMzYwIiB5Mj0iMzAiLz4KICAgIDxsaW5lIHgxPSIzMTAiIHkxPSI4MCIgeDI9IjMwMyIgeTI9Ijg3Ii8+CiAgPC9nPgoKICA8IS0tIGdyb3VuZCAtLT4KICA8cmVjdCB4PSIwIiB5PSIyNDUiIHdpZHRoPSI0MDAiIGhlaWdodD0iNTUiIGZpbGw9IiNjN2E2NzUiLz4KICA8cmVjdCB4PSIwIiB5PSIyNDUiIHdpZHRoPSI0MDAiIGhlaWdodD0iNiIgZmlsbD0iI2E4ODQ1YSIvPgoKICA8IS0tIHNvbGFyIHBhbmVsIG9uIGEgcG9sZSAtLT4KICA8cmVjdCB4PSI1NSIgeT0iMTY1IiB3aWR0aD0iMzQiIGhlaWdodD0iMTQiIHJ4PSIyIiBmaWxsPSIjMTY2NTM0Ii8+CiAgPHJlY3QgeD0iNjYiIHk9IjE3OSIgd2lkdGg9IjEyIiBoZWlnaHQ9IjcwIiBmaWxsPSIjNzg3MTZjIi8+CiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMzUsMTEwKSByb3RhdGUoLTgpIj4KICAgIDxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIxMTAiIGhlaWdodD0iNzAiIHJ4PSI0IiBmaWxsPSJ1cmwoI3BhbmVsKSIgc3Ryb2tlPSIjMGYxNzJhIiBzdHJva2Utd2lkdGg9IjIiLz4KICAgIDxnIHN0cm9rZT0iIzNiODJmNiIgc3Ryb2tlLXdpZHRoPSIyIj4KICAgICAgPGxpbmUgeDE9IjI3LjUiIHkxPSIwIiB4Mj0iMjcuNSIgeTI9IjcwIi8+CiAgICAgIDxsaW5lIHgxPSI1NSIgeTE9IjAiIHgyPSI1NSIgeTI9IjcwIi8+CiAgICAgIDxsaW5lIHgxPSI4Mi41IiB5MT0iMCIgeDI9IjgyLjUiIHkyPSI3MCIvPgogICAgICA8bGluZSB4MT0iMCIgeTE9IjIzIiB4Mj0iMTEwIiB5Mj0iMjMiLz4KICAgICAgPGxpbmUgeDE9IjAiIHkxPSI0NiIgeDI9IjExMCIgeTI9IjQ2Ii8+CiAgICA8L2c+CiAgPC9nPgoKICA8IS0tIGNvbnRyb2xsZXIgLyB0aW1lciBib3ggLS0+CiAgPHJlY3QgeD0iMTUwIiB5PSIxNTAiIHdpZHRoPSI3MCIgaGVpZ2h0PSI5MCIgcng9IjgiIGZpbGw9IiNmZmZmZmYiIHN0cm9rZT0iIzE2NjUzNCIgc3Ryb2tlLXdpZHRoPSIzIi8+CiAgPHJlY3QgeD0iMTYwIiB5PSIxNjIiIHdpZHRoPSI1MCIgaGVpZ2h0PSIyNiIgcng9IjQiIGZpbGw9IiMwZjE3MmEiLz4KICA8dGV4dCB4PSIxODUiIHk9IjE4MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNGFkZTgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj4wODowMDwvdGV4dD4KICA8Y2lyY2xlIGN4PSIxNjciIGN5PSIyMDUiIHI9IjciIGZpbGw9IiMxNjY1MzQiLz4KICA8Y2lyY2xlIGN4PSIxODUiIGN5PSIyMDUiIHI9IjciIGZpbGw9IiMyMmM1NWUiLz4KICA8Y2lyY2xlIGN4PSIyMDMiIGN5PSIyMDUiIHI9IjciIGZpbGw9IiMxNjY1MzQiLz4KICA8cmVjdCB4PSIxNjAiIHk9IjIxOCIgd2lkdGg9IjUwIiBoZWlnaHQ9IjEwIiByeD0iMyIgZmlsbD0iI2RjZmNlNyIvPgogIDxyZWN0IHg9IjE3OCIgeT0iMjQwIiB3aWR0aD0iMTQiIGhlaWdodD0iMTYiIGZpbGw9IiM5NGEzYjgiLz4KCiAgPCEtLSBob3NlIGZyb20gY29udHJvbGxlciBkb3duIHRvIGRyaXAgbGluZSAtLT4KICA8cGF0aCBkPSJNMTg1IDI1NiBDMTg1IDI3MCwgMTUwIDI3MCwgMTUwIDI4NSIgc3Ryb2tlPSIjMTY2NTM0IiBzdHJva2Utd2lkdGg9IjYiIGZpbGw9Im5vbmUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgogIDxwYXRoIGQ9Ik0xNTAgMjg1IEwzNDAgMjg1IiBzdHJva2U9IiMxNjY1MzQiIHN0cm9rZS13aWR0aD0iNiIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CgogIDwhLS0gZHJpcCBlbWl0dGVycyArIHdhdGVyIGRyb3BzICsgc21hbGwgcGxhbnRzIGFsb25nIHRoZSBsaW5lIC0tPgogIDxnPgogICAgPGNpcmNsZSBjeD0iMTkwIiBjeT0iMjg1IiByPSIzIiBmaWxsPSIjMGYxNzJhIi8+CiAgICA8cGF0aCBkPSJNMTkwIDI4OSBxNCA4IDAgMTQgcS00IC02IDAgLTE0IiBmaWxsPSIjMzhiZGY4Ii8+CgogICAgPGNpcmNsZSBjeD0iMjQwIiBjeT0iMjg1IiByPSIzIiBmaWxsPSIjMGYxNzJhIi8+CiAgICA8cGF0aCBkPSJNMjQwIDI4OSBxNCA4IDAgMTQgcS00IC02IDAgLTE0IiBmaWxsPSIjMzhiZGY4Ii8+CgogICAgPGNpcmNsZSBjeD0iMjkwIiBjeT0iMjg1IiByPSIzIiBmaWxsPSIjMGYxNzJhIi8+CiAgICA8cGF0aCBkPSJNMjkwIDI4OSBxNCA4IDAgMTQgcS00IC02IDAgLTE0IiBmaWxsPSIjMzhiZGY4Ii8+CiAgPC9nPgoKICA8IS0tIGxpdHRsZSBwbGFudHMgLS0+CiAgPGcgZmlsbD0iIzIyYzU1ZSI+CiAgICA8cGF0aCBkPSJNMjIwIDI0NSBxLTEwIC0yNSAtMjIgLTI4IHExNCAyIDIyIDE0IHEyIC0xOCAxNiAtMjQgcS0xMCAxNCAtOCAzMiBxLTQgNCAtOCA2eiIvPgogICAgPHBhdGggZD0iTTI3MCAyNDggcS04IC0yMCAtMTggLTIzIHExMSAyIDE4IDExIHEyIC0xNSAxMyAtMjAgcS04IDExIC02IDI2IHEtMyA0IC03IDZ6Ii8+CiAgICA8cGF0aCBkPSJNMzIwIDI0NSBxLTEwIC0yNSAtMjIgLTI4IHExNCAyIDIyIDE0IHEyIC0xOCAxNiAtMjQgcS0xMCAxNCAtOCAzMiBxLTQgNCAtOCA2eiIvPgogIDwvZz4KPC9zdmc+Cg==",
    ],
    description:
      "ระบบตั้งเวลารดน้ำอัตโนมัติพลังงานแสงอาทิตย์ ควบคุมผ่านแอปพลิเคชันบนมือถือ ตั้งเวลาและปริมาณน้ำได้อิสระ ประหยัดพลังงาน ไม่ต้องเปลี่ยนแบตเตอรี่บ่อย เหมาะสำหรับสวนขนาดเล็กถึงกลาง",
    sizes: [{ label: "ชุดมาตรฐาน", price: 2450 }],
    specs: {
      "แหล่งพลังงาน": "โซลาร์เซลล์ในตัว",
      "การเชื่อมต่อ": "Wi-Fi / แอปมือถือ",
      "กันน้ำ": "IP65",
    },
    care: [
      { title: "การติดตั้ง", desc: "ติดตั้งแผงโซลาร์ในจุดที่รับแดดตรงอย่างน้อย 4 ชม./วัน" },
    ],
  },
  {
    id: 6,
    name: "เมล็ดพันธุ์ไมโครกรีนรวม",
    category: "seeds",
    tag: "ORGANIC SEEDS",
    price: 120,
    origin: "น่าน",
    rating: 4.9,
    ratingCount: 302,
    image:
      "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=800&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=800&auto=format&fit=crop",
    ],
    description:
      "ชุดเมล็ดพันธุ์ไมโครกรีนคละสายพันธุ์ ปลูกง่าย เก็บเกี่ยวได้ภายใน 7-10 วัน อุดมด้วยวิตามินและแร่ธาตุสูงกว่าผักโตเต็มวัยหลายเท่า เหมาะสำหรับปลูกในพื้นที่จำกัด",
    sizes: [{ label: "ซองรวม 20 กรัม", price: 120 }],
    specs: {
      "ระยะเก็บเกี่ยว": "7-10 วัน",
      "จำนวนสายพันธุ์": "5 ชนิดคละ",
    },
    care: [
      { title: "การปลูก", desc: "โรยเมล็ดบนดินชื้น ไม่ต้องกลบ วางในที่มีแสงรำไร" },
    ],
  },
  {
    id: 7,
    name: "เมล็ดพันธุ์แตงกวาญี่ปุ่น",
    category: "seeds",
    tag: "SEEDS",
    price: 95,
    origin: "เชียงใหม่",
    rating: 4.6,
    ratingCount: 77,
    image:
      "https://images.pexels.com/photos/2329440/pexels-photo-2329440.jpeg?auto=compress&cs=tinysrgb&w=800",
    gallery: [
      "https://images.pexels.com/photos/2329440/pexels-photo-2329440.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?q=80&w=800&auto=format&fit=crop",
    ],
    description:
      "เมล็ดพันธุ์แตงกวาญี่ปุ่นแท้ ผลตรง เปลือกบาง กรอบ ไม่ขม ทนทานต่อโรคใบไหม้ ให้ผลผลิตต่อเนื่อง เหมาะปลูกทั้งค้างและพื้นราบ",
    sizes: [{ label: "ซอง 3 กรัม", price: 95 }],
    specs: {
      "ระยะเก็บเกี่ยว": "40-45 วัน",
      "อัตราการงอก": "90%+",
    },
    care: [
      { title: "การเพาะ", desc: "เพาะในถาดหลุมก่อนย้ายปลูกเมื่อมีใบจริง 2-3 ใบ" },
    ],
  },
  {
    id: 8,
    name: "ปุ๋ยหมักมูลไส้เดือน (10 กก.)",
    category: "organic",
    tag: "FERTILIZERS",
    price: 320,
    origin: "ภาคเหนือ",
    rating: 4.8,
    ratingCount: 63,
    image:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=800&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=800&auto=format&fit=crop",
    ],
    description:
      "ปุ๋ยหมักมูลไส้เดือนแท้ 100% อุดมด้วยจุลินทรีย์ที่เป็นประโยชน์ต่อดิน ช่วยเร่งการเจริญเติบโตของราก เหมาะสำหรับพืชทุกชนิดทั้งไม้ดอกและพืชผัก",
    sizes: [{ label: "ถุง 10 กก.", price: 320 }],
    specs: { "ชนิด": "มูลไส้เดือนแท้ 100%", "ค่า pH": "6.8 - 7.2" },
    care: [{ title: "การใช้งาน", desc: "โรยรอบโคนต้น 2-3 ช้อนโต๊ะ ทุก 2 สัปดาห์" }],
  },
  {
    id: 9,
    name: "กรรไกรตัดกิ่งอเนกประสงค์",
    category: "tools",
    tag: "TOOLS",
    price: 450,
    origin: "น่าน",
    rating: 4.7,
    ratingCount: 91,
    image:
      "https://images.pexels.com/photos/12142540/pexels-photo-12142540.jpeg?auto=compress&cs=tinysrgb&w=800",
    gallery: [
      "https://images.pexels.com/photos/12142540/pexels-photo-12142540.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.unsplash.com/photo-1617396900799-f4ec2b43c7ae?q=80&w=800&auto=format&fit=crop",
    ],
    description:
      "กรรไกรตัดกิ่งใบมีดสแตนเลสคมกริบ ตัดลื่น ไม่ทำร้ายเนื้อเยื่อพืช ด้ามจับยางกันลื่น เหมาะสำหรับตัดแต่งกิ่งไม้ขนาดเล็กถึงกลาง",
    sizes: [{ label: "ขนาดมาตรฐาน", price: 450 }],
    specs: { "วัสดุใบมีด": "สแตนเลส SK5", "ความยาว": "20 ซม." },
    care: [{ title: "การดูแล", desc: "เช็ดใบมีดหลังใช้งาน หยอดน้ำมันป้องกันสนิมเดือนละครั้ง" }],
  },
];

export function getProductById(id) {
  return PRODUCTS.find((p) => String(p.id) === String(id));
}