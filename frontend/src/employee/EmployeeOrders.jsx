// EmployeeOrders.jsx — หน้าคำสั่งซื้อ (พร้อมอนุมัติคำสั่งซื้อ)
import { useMemo, useState } from "react";
import {
  IconOrders,
  IconCheck,
  IconX,
  IconEye,
  IconAlert,
} from "./EmployeeIcons";
import "./employee.css";

const INITIAL_ORDERS = [
  { id: "ORD-10231", customer: "กัญญา วนาวรรณ", items: "ข้าวหอมมะลิ x 20 กก.", total: 2400, date: "3 ก.ค. 2569", status: "pending" },
  { id: "ORD-10230", customer: "อนาชัย นรินทร์", items: "มะม่วงน้ำดอกไม้ x 5 กก.", total: 750, date: "3 ก.ค. 2569", status: "pending" },
  { id: "ORD-10229", customer: "วิไลลักษณ์ แสงดาว", items: "ผักกาดขาว x 10 กก.", total: 450, date: "2 ก.ค. 2569", status: "approved" },
  { id: "ORD-10228", customer: "สมบัติ ทีชผล", items: "ไข่ไก่เบอร์ 0 x 3 แผง", total: 315, date: "2 ก.ค. 2569", status: "approved" },
  { id: "ORD-10227", customer: "ธนากร ศรีสุข", items: "ทุเรียนหมอนทอง x 2 ลูก", total: 1200, date: "1 ก.ค. 2569", status: "rejected" },
];

const STATUS_MAP = {
  pending: { label: "รอดำเนินการ", cls: "amber" },
  approved: { label: "อนุมัติแล้ว", cls: "green" },
  rejected: { label: "ปฏิเสธแล้ว", cls: "red" },
};

export default function EmployeeOrders() {
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [filter, setFilter] = useState("all");

  const stats = useMemo(() => {
    const pending = orders.filter((o) => o.status === "pending").length;
    const approved = orders.filter((o) => o.status === "approved").length;
    const rejected = orders.filter((o) => o.status === "rejected").length;
    return { pending, approved, rejected };
  }, [orders]);

  const visible = orders.filter((o) => filter === "all" || o.status === filter);

  const setStatus = (id, status) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  return (
    <>
      <div className="emp-page-header">
        <div>
          <h1 className="emp-page-title">หน้าคำสั่งซื้อ</h1>
          <p className="emp-page-sub">ตรวจสอบและอนุมัติคำสั่งซื้อที่เข้ามาในระบบ Farmart</p>
        </div>
      </div>

      <div className="emp-stat-grid">
        <div className="emp-card">
          <div className="emp-stat-top">
            <div className="emp-stat-icon" style={{ background: "#fffbeb", color: "#b45309" }}>
              <IconAlert width={18} height={18} />
            </div>
            <span className="emp-stat-label">รอดำเนินการ</span>
          </div>
          <p className="emp-stat-value">{stats.pending}</p>
        </div>
        <div className="emp-card">
          <div className="emp-stat-top">
            <div className="emp-stat-icon" style={{ background: "var(--emp-green-50)", color: "var(--emp-green-700)" }}>
              <IconCheck width={18} height={18} />
            </div>
            <span className="emp-stat-label">อนุมัติแล้ว</span>
          </div>
          <p className="emp-stat-value">{stats.approved}</p>
        </div>
        <div className="emp-card">
          <div className="emp-stat-top">
            <div className="emp-stat-icon" style={{ background: "#fef2f2", color: "var(--emp-red-500)" }}>
              <IconX width={18} height={18} />
            </div>
            <span className="emp-stat-label">ปฏิเสธแล้ว</span>
          </div>
          <p className="emp-stat-value">{stats.rejected}</p>
        </div>
      </div>

      <div className="emp-panel">
        <div className="emp-panel-head">
          <h2 className="emp-panel-title">รายการคำสั่งซื้อ</h2>
          <select className="emp-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">ทั้งหมด</option>
            <option value="pending">รอดำเนินการ</option>
            <option value="approved">อนุมัติแล้ว</option>
            <option value="rejected">ปฏิเสธแล้ว</option>
          </select>
        </div>

        <div className="emp-table-wrap">
          <table className="emp-table">
            <thead>
              <tr>
                <th>รหัสคำสั่งซื้อ</th>
                <th>ลูกค้า</th>
                <th>รายการสินค้า</th>
                <th>ยอดรวม</th>
                <th>วันที่สั่งซื้อ</th>
                <th>สถานะ</th>
                <th>การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((o) => (
                <tr key={o.id}>
                  <td className="emp-cell-strong">{o.id}</td>
                  <td>{o.customer}</td>
                  <td>{o.items}</td>
                  <td className="emp-cell-strong">฿{o.total.toLocaleString()}</td>
                  <td className="emp-cell-sub">{o.date}</td>
                  <td>
                    <span className={`emp-badge ${STATUS_MAP[o.status].cls}`}>
                      <span className="dot" />
                      {STATUS_MAP[o.status].label}
                    </span>
                  </td>
                  <td>
                    <div className="emp-actions">
                      <button className="emp-icon-action" title="ดูรายละเอียด">
                        <IconEye width={15} height={15} />
                      </button>
                      {o.status === "pending" && (
                        <>
                          <button
                            className="emp-icon-action"
                            title="อนุมัติคำสั่งซื้อ"
                            onClick={() => setStatus(o.id, "approved")}
                          >
                            <IconCheck width={15} height={15} />
                          </button>
                          <button
                            className="emp-icon-action danger"
                            title="ปฏิเสธคำสั่งซื้อ"
                            onClick={() => setStatus(o.id, "rejected")}
                          >
                            <IconX width={15} height={15} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div className="emp-empty">ไม่มีคำสั่งซื้อในหมวดนี้</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="emp-panel-foot">
          <span>แสดงผล {visible.length} จาก {orders.length} รายการ</span>
        </div>
      </div>
    </>
  );
}