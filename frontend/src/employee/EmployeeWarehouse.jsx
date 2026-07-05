// EmployeeWarehouse.jsx — หน้าคลังสินค้า (แดชบอร์ดสินค้า + ตารางสินค้า)
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  IconBox,
  IconAlert,
  IconPlus,
  IconEdit,
  IconTrash,
  IconEye,
} from "./EmployeeIcons";
import "./employee.css";

// ตัวอย่างข้อมูลสินค้า — เชื่อมกับ API คลังสินค้าจริงภายหลัง
export const INITIAL_PRODUCTS = [
  { id: "P-001", name: "ข้าวหอมมะลิ 100%", category: "ข้าวและธัญพืช", stock: 82, price: 120, status: "active" },
  { id: "P-002", name: "มะม่วงน้ำดอกไม้", category: "ผลไม้", stock: 6, price: 150, status: "low" },
  { id: "P-003", name: "ผักกาดขาว", category: "ผัก", stock: 0, price: 45, status: "out" },
  { id: "P-004", name: "ไข่ไก่เบอร์ 0", category: "โปรตีน", stock: 140, price: 105, status: "active" },
  { id: "P-005", name: "ทุเรียนหมอนทอง", category: "ผลไม้", stock: 4, price: 600, status: "low" },
];

const STATUS_MAP = {
  active: { label: "พร้อมขาย", cls: "green" },
  low: { label: "ใกล้หมด", cls: "amber" },
  out: { label: "สินค้าหมด", cls: "red" },
};

export default function EmployeeWarehouse() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [pendingDelete, setPendingDelete] = useState(null);

  const stats = useMemo(() => {
    const total = products.length;
    const low = products.filter((p) => p.status === "low").length;
    const out = products.filter((p) => p.status === "out").length;
    return { total, low, out };
  }, [products]);

  const confirmDelete = () => {
    setProducts((prev) => prev.filter((p) => p.id !== pendingDelete.id));
    setPendingDelete(null);
  };

  return (
    <>
      <div className="emp-page-header">
        <div>
          <h1 className="emp-page-title">หน้าคลังสินค้า</h1>
          <p className="emp-page-sub">ภาพรวมสต๊อกสินค้า และจัดการรายการสินค้าทั้งหมด</p>
        </div>
        <Link to="/employee/warehouse/add" className="emp-btn emp-btn-primary">
          <IconPlus width={16} height={16} />
          เพิ่มสินค้า
        </Link>
      </div>

      {/* แดชบอร์ดสินค้า */}
      <div className="emp-stat-grid">
        <div className="emp-card">
          <div className="emp-stat-top">
            <div className="emp-stat-icon" style={{ background: "var(--emp-green-50)", color: "var(--emp-green-700)" }}>
              <IconBox width={18} height={18} />
            </div>
            <span className="emp-stat-label">สินค้าทั้งหมด</span>
          </div>
          <p className="emp-stat-value">{stats.total}</p>
          <p className="emp-stat-delta neutral">รายการในคลังทั้งหมด</p>
        </div>
        <div className="emp-card">
          <div className="emp-stat-top">
            <div className="emp-stat-icon" style={{ background: "#fffbeb", color: "#b45309" }}>
              <IconAlert width={18} height={18} />
            </div>
            <span className="emp-stat-label">สินค้าใกล้หมด</span>
          </div>
          <p className="emp-stat-value">{stats.low}</p>
          <p className="emp-stat-delta down">ควรเติมสต๊อกเร็ว ๆ นี้</p>
        </div>
        <div className="emp-card">
          <div className="emp-stat-top">
            <div className="emp-stat-icon" style={{ background: "#fef2f2", color: "var(--emp-red-500)" }}>
              <IconAlert width={18} height={18} />
            </div>
            <span className="emp-stat-label">สินค้าหมด</span>
          </div>
          <p className="emp-stat-value">{stats.out}</p>
          <p className="emp-stat-delta down">ไม่พร้อมขายในขณะนี้</p>
        </div>
      </div>

      {/* ตารางสินค้า */}
      <div className="emp-panel">
        <div className="emp-panel-head">
          <h2 className="emp-panel-title">รายการสินค้า</h2>
        </div>

        <div className="emp-table-wrap">
          <table className="emp-table">
            <thead>
              <tr>
                <th>สินค้า</th>
                <th>หมวดหมู่</th>
                <th>คงเหลือ</th>
                <th>ราคา</th>
                <th>สถานะ</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className="emp-thumb">
                        <IconBox width={16} height={16} />
                      </div>
                      <div>
                        <div className="emp-cell-strong">{p.name}</div>
                        <div className="emp-cell-sub">{p.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>{p.category}</td>
                  <td className="emp-cell-strong">{p.stock} หน่วย</td>
                  <td>฿{p.price.toLocaleString()}</td>
                  <td>
                    <span className={`emp-badge ${STATUS_MAP[p.status].cls}`}>
                      <span className="dot" />
                      {STATUS_MAP[p.status].label}
                    </span>
                  </td>
                  <td>
                    <div className="emp-actions">
                      <button className="emp-icon-action" title="ดูรายละเอียด">
                        <IconEye width={15} height={15} />
                      </button>
                      <Link to={`/employee/warehouse/edit/${p.id}`} className="emp-icon-action" title="แก้ไขสินค้า">
                        <IconEdit width={15} height={15} />
                      </Link>
                      <button
                        className="emp-icon-action danger"
                        title="ลบสินค้า"
                        onClick={() => setPendingDelete(p)}
                      >
                        <IconTrash width={15} height={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="emp-empty">ยังไม่มีสินค้าในคลัง กด "เพิ่มสินค้า" เพื่อเริ่มต้น</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="emp-panel-foot">
          <span>แสดงผลสินค้า {products.length} รายการ</span>
        </div>
      </div>

      {pendingDelete && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(15,23,42,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60,
          }}
        >
          <div className="emp-card" style={{ width: 360 }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 16 }}>ลบสินค้านี้ใช่หรือไม่?</h3>
            <p style={{ margin: "0 0 20px", fontSize: 13.5, color: "var(--emp-gray-500)" }}>
              "{pendingDelete.name}" จะถูกลบออกจากคลังสินค้าอย่างถาวร
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button className="emp-btn emp-btn-outline" onClick={() => setPendingDelete(null)}>ยกเลิก</button>
              <button className="emp-btn emp-btn-danger" onClick={confirmDelete}>ลบสินค้า</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}