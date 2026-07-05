// EmployeeSettings.jsx — หน้าตั้งค่า
import { useState } from "react";
import "./employee.css";

export default function EmployeeSettings() {
  const [profile, setProfile] = useState({
    name: "พนักงานคลังสินค้า",
    email: "employee@farmart.co.th",
    phone: "08x-xxx-xxxx",
  });
  const [notify, setNotify] = useState({
    newOrder: true,
    lowStock: true,
    shippingUpdate: false,
  });
  const [savedMsg, setSavedMsg] = useState("");

  const updateProfile = (key) => (e) => setProfile((p) => ({ ...p, [key]: e.target.value }));
  const toggleNotify = (key) => setNotify((n) => ({ ...n, [key]: !n[key] }));

  const handleSave = (e) => {
    e.preventDefault();
    // TODO: เชื่อมต่อ API บันทึกการตั้งค่าจริง
    setSavedMsg("บันทึกการตั้งค่าเรียบร้อยแล้ว");
    setTimeout(() => setSavedMsg(""), 2500);
  };

  return (
    <>
      <div className="emp-page-header">
        <div>
          <h1 className="emp-page-title">ตั้งค่า</h1>
          <p className="emp-page-sub">จัดการข้อมูลบัญชีและการแจ้งเตือนของคุณ</p>
        </div>
      </div>

      <div className="emp-two-col">
        <form className="emp-panel" style={{ padding: 24 }} onSubmit={handleSave}>
          <h2 className="emp-panel-title" style={{ marginBottom: 18 }}>ข้อมูลส่วนตัว</h2>
          <div className="emp-form-grid">
            <div className="emp-field full">
              <label className="emp-label">ชื่อ-นามสกุล</label>
              <input className="emp-input" value={profile.name} onChange={updateProfile("name")} />
            </div>
            <div className="emp-field">
              <label className="emp-label">อีเมล</label>
              <input className="emp-input" type="email" value={profile.email} onChange={updateProfile("email")} />
            </div>
            <div className="emp-field">
              <label className="emp-label">เบอร์โทรศัพท์</label>
              <input className="emp-input" value={profile.phone} onChange={updateProfile("phone")} />
            </div>
            <div className="emp-field">
              <label className="emp-label">รหัสผ่านใหม่</label>
              <input className="emp-input" type="password" placeholder="เว้นว่างไว้หากไม่ต้องการเปลี่ยน" />
            </div>
            <div className="emp-field">
              <label className="emp-label">ยืนยันรหัสผ่านใหม่</label>
              <input className="emp-input" type="password" placeholder="กรอกรหัสผ่านอีกครั้ง" />
            </div>
          </div>

          <div className="emp-form-actions" style={{ justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "var(--emp-green-700)" }}>{savedMsg}</span>
            <button type="submit" className="emp-btn emp-btn-primary">บันทึกการเปลี่ยนแปลง</button>
          </div>
        </form>

        <div className="emp-panel" style={{ padding: 24 }}>
          <h2 className="emp-panel-title" style={{ marginBottom: 18 }}>การแจ้งเตือน</h2>
          {[
            { key: "newOrder", label: "แจ้งเตือนเมื่อมีคำสั่งซื้อใหม่" },
            { key: "lowStock", label: "แจ้งเตือนเมื่อสินค้าใกล้หมด" },
            { key: "shippingUpdate", label: "แจ้งเตือนเมื่อสถานะพัสดุเปลี่ยน" },
          ].map(({ key, label }) => (
            <label
              key={key}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 0", borderBottom: "1px solid var(--emp-gray-100)", fontSize: 13.5, cursor: "pointer",
              }}
            >
              {label}
              <input type="checkbox" checked={notify[key]} onChange={() => toggleNotify(key)} />
            </label>
          ))}
        </div>
      </div>
    </>
  );
}