// EmployeeProductEdit.jsx — หน้าแก้ไขสินค้า (ทำปุ่มเชื่อมจากตารางสินค้า)
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { IconChevronLeft, IconUpload, IconTrash } from "./EmployeeIcons";
import { INITIAL_PRODUCTS } from "./EmployeeWarehouse";
import "./employee.css";

export default function EmployeeProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ในของจริงควรดึงข้อมูลสินค้าตาม id จาก API แทนข้อมูลตัวอย่างนี้
  const existing = useMemo(
    () => INITIAL_PRODUCTS.find((p) => p.id === id) ?? INITIAL_PRODUCTS[0],
    [id]
  );

  const [form, setForm] = useState({
    name: existing.name,
    category: existing.category,
    price: existing.price,
    stock: existing.stock,
    description: "",
  });
  const [saved, setSaved] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: เชื่อมต่อ API บันทึกการแก้ไขสินค้าจริง
    setSaved(true);
    setTimeout(() => navigate("/employee/warehouse"), 900);
  };

  const handleDelete = () => {
    // TODO: เชื่อมต่อ API ลบสินค้าจริง
    navigate("/employee/warehouse");
  };

  return (
    <>
      <Link to="/employee/warehouse" className="emp-back-link">
        <IconChevronLeft width={15} height={15} />
        กลับไปหน้าคลังสินค้า
      </Link>

      <div className="emp-page-header">
        <div>
          <h1 className="emp-page-title">แก้ไขสินค้า</h1>
          <p className="emp-page-sub">รหัสสินค้า: {existing.id}</p>
        </div>
        <button className="emp-btn emp-btn-danger" onClick={handleDelete}>
          <IconTrash width={16} height={16} />
          ลบสินค้านี้
        </button>
      </div>

      <form className="emp-panel" style={{ padding: 24 }} onSubmit={handleSubmit}>
        <div className="emp-form-grid">
          <div className="emp-field full">
            <label className="emp-label">ชื่อสินค้า</label>
            <input className="emp-input" value={form.name} onChange={update("name")} required />
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
              value={form.stock}
              onChange={update("stock")}
              required
            />
          </div>

          <div className="emp-field">
            <label className="emp-label">รูปภาพสินค้า</label>
            <div className="emp-upload-box">
              <IconUpload width={22} height={22} style={{ marginBottom: 8 }} />
              <div>คลิกเพื่อเปลี่ยนรูปภาพสินค้า</div>
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
            {saved ? "บันทึกแล้ว ✓" : "บันทึกการแก้ไข"}
          </button>
        </div>
      </form>
    </>
  );
}