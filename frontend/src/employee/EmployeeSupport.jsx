// EmployeeSupport.jsx — หน้า support
import { useState } from "react";
import { IconSupport, IconChevronLeft } from "./EmployeeIcons";
import "./employee.css";

const FAQS = [
  {
    q: "จะอนุมัติคำสั่งซื้อได้อย่างไร?",
    a: "ไปที่หน้าคำสั่งซื้อ เลือกคำสั่งซื้อที่มีสถานะ \"รอดำเนินการ\" แล้วกดปุ่มเครื่องหมายถูกเพื่ออนุมัติ หรือกดปุ่มกากบาทเพื่อปฏิเสธ",
  },
  {
    q: "เพิ่มหรือแก้ไขสินค้าในคลังได้ที่ไหน?",
    a: "ไปที่หน้าคลังสินค้า กดปุ่ม \"เพิ่มสินค้า\" ที่มุมขวาบนเพื่อเพิ่มสินค้าใหม่ หรือกดไอคอนดินสอในตารางสินค้าเพื่อแก้ไขสินค้าที่มีอยู่แล้ว",
  },
  {
    q: "อัปเดตสถานะการขนส่งอย่างไร?",
    a: "ไปที่หน้าการขนส่ง แล้วกดปุ่ม \"อัปเดตสถานะ\" ในแถวของพัสดุนั้น ๆ ระบบจะเปลี่ยนสถานะไปยังขั้นตอนถัดไปโดยอัตโนมัติ",
  },
  {
    q: "ลืมรหัสผ่านต้องทำอย่างไร?",
    a: "ไปที่หน้าตั้งค่า แล้วกรอกรหัสผ่านใหม่ในช่อง \"รหัสผ่านใหม่\" หากเข้าสู่ระบบไม่ได้ กรุณาติดต่อทีมงานผ่านแบบฟอร์มด้านล่าง",
  },
];

export default function EmployeeSupport() {
  const [openIdx, setOpenIdx] = useState(0);
  const [form, setForm] = useState({ subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: เชื่อมต่อ API ส่งคำร้องขอความช่วยเหลือจริง
    setSent(true);
    setForm({ subject: "", message: "" });
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <>
      <div className="emp-page-header">
        <div>
          <h1 className="emp-page-title">Support</h1>
          <p className="emp-page-sub">คำถามที่พบบ่อย และช่องทางติดต่อทีมงาน</p>
        </div>
      </div>

      <div className="emp-two-col">
        <div className="emp-panel">
          <div className="emp-panel-head">
            <h2 className="emp-panel-title">คำถามที่พบบ่อย</h2>
          </div>
          {FAQS.map((item, idx) => (
            <div className="emp-faq-item" key={item.q}>
              <button
                className="emp-faq-q"
                onClick={() => setOpenIdx(openIdx === idx ? -1 : idx)}
              >
                {item.q}
                <IconChevronLeft
                  width={14}
                  height={14}
                  style={{ transform: openIdx === idx ? "rotate(90deg)" : "rotate(-90deg)", transition: "transform .15s" }}
                />
              </button>
              {openIdx === idx && <div className="emp-faq-a">{item.a}</div>}
            </div>
          ))}
        </div>

        <form className="emp-panel" style={{ padding: 24 }} onSubmit={handleSubmit}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <div className="emp-stat-icon" style={{ background: "var(--emp-green-50)", color: "var(--emp-green-700)" }}>
              <IconSupport width={18} height={18} />
            </div>
            <h2 className="emp-panel-title">ติดต่อทีมงาน</h2>
          </div>

          <div className="emp-form-grid">
            <div className="emp-field full">
              <label className="emp-label">หัวข้อ</label>
              <input
                className="emp-input"
                placeholder="เช่น ไม่สามารถอนุมัติคำสั่งซื้อได้"
                value={form.subject}
                onChange={update("subject")}
                required
              />
            </div>
            <div className="emp-field full">
              <label className="emp-label">รายละเอียด</label>
              <textarea
                className="emp-textarea"
                placeholder="อธิบายปัญหาที่พบโดยละเอียด"
                value={form.message}
                onChange={update("message")}
                required
              />
            </div>
          </div>

          <div className="emp-form-actions" style={{ justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "var(--emp-green-700)" }}>
              {sent ? "ส่งคำร้องเรียบร้อยแล้ว ทีมงานจะติดต่อกลับเร็ว ๆ นี้" : ""}
            </span>
            <button type="submit" className="emp-btn emp-btn-primary">ส่งคำร้อง</button>
          </div>
        </form>
      </div>
    </>
  );
}