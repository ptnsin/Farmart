// EmployeeShipping.jsx — หน้าการขนส่ง
import { useState } from "react";
import { IconTruck, IconCheck, IconEye } from "./EmployeeIcons";
import "./employee.css";

const INITIAL_SHIPMENTS = [
  { id: "SHP-5521", order: "ORD-10229", carrier: "Farmart Express", status: "delivered", eta: "2 ก.ค. 2569" },
  { id: "SHP-5522", order: "ORD-10228", carrier: "Kerry Express", status: "in_transit", eta: "6 ก.ค. 2569" },
  { id: "SHP-5523", order: "ORD-10231", carrier: "Farmart Express", status: "preparing", eta: "8 ก.ค. 2569" },
  { id: "SHP-5524", order: "ORD-10230", carrier: "Flash Express", status: "in_transit", eta: "7 ก.ค. 2569" },
];

const STATUS_MAP = {
  preparing: { label: "กำลังเตรียมพัสดุ", cls: "gray" },
  in_transit: { label: "อยู่ระหว่างขนส่ง", cls: "amber" },
  delivered: { label: "จัดส่งสำเร็จ", cls: "green" },
};

const NEXT_STATUS = { preparing: "in_transit", in_transit: "delivered" };

export default function EmployeeShipping() {
  const [shipments, setShipments] = useState(INITIAL_SHIPMENTS);

  const advance = (id) => {
    setShipments((prev) =>
      prev.map((s) => (s.id === id && NEXT_STATUS[s.status] ? { ...s, status: NEXT_STATUS[s.status] } : s))
    );
  };

  return (
    <>
      <div className="emp-page-header">
        <div>
          <h1 className="emp-page-title">หน้าการขนส่ง</h1>
          <p className="emp-page-sub">ติดตามสถานะพัสดุและอัปเดตความคืบหน้าการจัดส่ง</p>
        </div>
      </div>

      <div className="emp-stat-grid">
        <div className="emp-card">
          <div className="emp-stat-top">
            <div className="emp-stat-icon" style={{ background: "var(--emp-gray-100)", color: "var(--emp-gray-500)" }}>
              <IconTruck width={18} height={18} />
            </div>
            <span className="emp-stat-label">กำลังเตรียมพัสดุ</span>
          </div>
          <p className="emp-stat-value">{shipments.filter((s) => s.status === "preparing").length}</p>
        </div>
        <div className="emp-card">
          <div className="emp-stat-top">
            <div className="emp-stat-icon" style={{ background: "#fffbeb", color: "#b45309" }}>
              <IconTruck width={18} height={18} />
            </div>
            <span className="emp-stat-label">อยู่ระหว่างขนส่ง</span>
          </div>
          <p className="emp-stat-value">{shipments.filter((s) => s.status === "in_transit").length}</p>
        </div>
        <div className="emp-card">
          <div className="emp-stat-top">
            <div className="emp-stat-icon" style={{ background: "var(--emp-green-50)", color: "var(--emp-green-700)" }}>
              <IconCheck width={18} height={18} />
            </div>
            <span className="emp-stat-label">จัดส่งสำเร็จ</span>
          </div>
          <p className="emp-stat-value">{shipments.filter((s) => s.status === "delivered").length}</p>
        </div>
      </div>

      <div className="emp-panel">
        <div className="emp-panel-head">
          <h2 className="emp-panel-title">รายการพัสดุ</h2>
        </div>
        <div className="emp-table-wrap">
          <table className="emp-table">
            <thead>
              <tr>
                <th>รหัสพัสดุ</th>
                <th>คำสั่งซื้อ</th>
                <th>ผู้ขนส่ง</th>
                <th>กำหนดส่งโดยประมาณ</th>
                <th>สถานะ</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((s) => (
                <tr key={s.id}>
                  <td className="emp-cell-strong">{s.id}</td>
                  <td>{s.order}</td>
                  <td>{s.carrier}</td>
                  <td className="emp-cell-sub">{s.eta}</td>
                  <td>
                    <span className={`emp-badge ${STATUS_MAP[s.status].cls}`}>
                      <span className="dot" />
                      {STATUS_MAP[s.status].label}
                    </span>
                  </td>
                  <td>
                    <div className="emp-actions">
                      <button className="emp-icon-action" title="ดูรายละเอียดการขนส่ง">
                        <IconEye width={15} height={15} />
                      </button>
                      {NEXT_STATUS[s.status] && (
                        <button className="emp-btn emp-btn-outline emp-btn-sm" onClick={() => advance(s.id)}>
                          อัปเดตสถานะ
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="emp-panel-foot">
          <span>แสดงผล {shipments.length} รายการ</span>
        </div>
      </div>
    </>
  );
}