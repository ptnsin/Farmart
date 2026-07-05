// EmployeeProductAdd.jsx — หน้าเพิ่มสินค้า (ทำปุ่มเชื่อมจากหน้าคลังสินค้า)
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IconChevronLeft, IconUpload } from "./EmployeeIcons";
import "./employee.css";

export default function EmployeeProductAdd() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    category: "ผัก",
    price: "",
    stock: "",
    description: "",
  });
  const [saved, setSaved] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: เชื่อมต่อ API เพิ่มสินค้าจริง
    setSaved(true);
    setTimeout(() => navigate("/employee/warehouse"), 900);
  };

  return (
    <>
      <Link to="/employee/warehouse" className="emp-back-link">
        <IconChevronLeft width={15} height={15} />
        กลับไปหน้าคลังสินค้า
      </Link>

      <div className="emp-page-header">
        <div>
          <h1 className="emp-page-title">เพิ่มสินค้าใหม่</h1>
          <p className="emp-page-sub">กรอกรายละเอียดสินค้าเพื่อเพิ่มเข้าคลังสินค้า</p>
        </div>
      </div>

      <form className="emp-panel" style={{ padding: 24 }} onSubmit={handleSubmit}>
        <div className="emp-form-grid">
          <div className="emp-field full">
            <label className="emp-label">ชื่อสินค้า</label>
            <input
              className="emp-input"
              placeholder="เช่น ข้าวหอมมะลิ 100%"
              value={form.name}
              onChange={update("name")}
              required
            />
          </div>

          <div className="emp-field">
            <label className="emp-label">หมวดหมู่</label>
            <select className="emp-form-select" value={form.category} onChange={update("category")}>
              <option>ผัก</option>
              <option>ผลไม้</option>
              <option>ข้าวและธัญพืช</option>
              <option>โปรตีน</option>
              <option>อื่น ๆ</option>
            </select>
          </div>

          <div className="emp-field">
            <label className="emp-label">ราคาต่อหน่วย (บาท)</label>
            <input
              className="emp-input"
              type="number"
              min="0"
              placeholder="0.00"
              value={form.price}
              onChange={update("price")}
              required
            />
          </div>

          <div className="emp-field">
            <label className="emp-label">จำนวนคงเหลือ</label>
            <input
              className="emp-input"
              type="number"
              min="0"
              placeholder="0"
              value={form.stock}
              onChange={update("stock")}
              required
            />
          </div>

          <div className="emp-field">
            <label className="emp-label">รูปภาพสินค้า</label>
            <div className="emp-upload-box">
              <IconUpload width={22} height={22} style={{ marginBottom: 8 }} />
              <div>ลากไฟล์มาวาง หรือคลิกเพื่อเลือกรูปภาพ</div>
              <div className="emp-hint">รองรับไฟล์ JPG, PNG ขนาดไม่เกิน 5MB</div>
            </div>
          </div>

          <div className="emp-field full">
            <label className="emp-label">รายละเอียดสินค้า</label>
            <textarea
              className="emp-textarea"
              placeholder="อธิบายรายละเอียด แหล่งที่มา หรือวิธีการเก็บรักษา"
              value={form.description}
              onChange={update("description")}
            />
          </div>
        </div>

        <div className="emp-form-actions">
          <Link to="/employee/warehouse" className="emp-btn emp-btn-outline">ยกเลิก</Link>
          <button type="submit" className="emp-btn emp-btn-primary">
            {saved ? "บันทึกแล้ว ✓" : "บันทึกสินค้า"}
          </button>
        </div>
      </form>
    </>
  );
}