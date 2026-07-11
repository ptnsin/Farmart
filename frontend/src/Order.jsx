import { Link } from "react-router-dom";
import {
  Sprout,
  Search,
  ShoppingCart,
  Bell,
  UserCircle2,
  ChevronRight,
  PackageSearch,
} from "lucide-react";
import { ORDERS } from "./Tracking";

// Small presentational helper — same status labels/order used by Tracking's
// stepper, just condensed into a single badge for the list view.
const STATUS_STYLES = {
  0: "bg-gray-100 text-gray-600",
  1: "bg-amber-100 text-amber-700",
  2: "bg-blue-100 text-blue-700",
  3: "bg-blue-100 text-blue-700",
  4: "bg-green-100 text-green-800",
};

export default function Orders() {
  // Turn the ORDERS map into a sorted array (newest order id first). Order
  // ids are date-based (AGH-YYYYMMDD), so a reverse string sort works fine.
  const orderList = Object.entries(ORDERS)
    .map(([id, order]) => {
      const total = order.items.reduce((sum, i) => sum + i.price * i.qty, 0);
      const itemsSummary = order.items.map((i) => i.name).join(", ");
      return { id, ...order, total, itemsSummary };
    })
    .sort((a, b) => b.id.localeCompare(a.id));

  return (
    <div className="min-h-screen w-full bg-gray-50 text-gray-900">
      {/* Top nav — shared with Home / Tracking */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto flex items-center gap-6 px-6 py-3.5">
          <Link to="/home" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-md bg-green-800 flex items-center justify-center">
              <Sprout className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">Farmart</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600 font-medium">
            <Link to="/home" className="hover:text-green-800">หน้าแรก</Link>
            <Link to="/products" className="hover:text-green-800">สินค้า</Link>
            <Link to="/tracking" className="hover:text-green-800">ติดตามพัสดุ</Link>
            <Link to="/orders" className="text-green-800">คำสั่งซื้อ</Link>
          </nav>

          <div className="flex-1 max-w-xs ml-auto relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาสินค้า..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
            />
          </div>

          <div className="flex items-center gap-1">
            <button className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50">
              <Bell className="w-5 h-5" />
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50">
              <ShoppingCart className="w-5 h-5" />
            </button>
            <Link
              to="/profile"
              className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50"
            >
              <UserCircle2 className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">คำสั่งซื้อของฉัน</h1>
          <p className="text-sm text-gray-500">
            ดูประวัติคำสั่งซื้อทั้งหมด กดที่รายการเพื่อติดตามสถานะการจัดส่ง
          </p>
        </div>

        {orderList.length === 0 ? (
          <div className="flex flex-col items-center text-center py-16 bg-white rounded-xl border border-gray-100">
            <PackageSearch className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-sm font-semibold text-gray-800 mb-1">ยังไม่มีคำสั่งซื้อ</p>
            <p className="text-sm text-gray-500">เมื่อคุณสั่งซื้อสินค้า รายการจะแสดงที่นี่</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-100 overflow-hidden">
            {orderList.map((order) => (
              <Link
                key={order.id}
                to={`/tracking?order=${order.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="w-11 h-11 rounded-lg bg-gray-50 flex items-center justify-center text-xl shrink-0">
                  {order.items[0]?.emoji ?? "📦"}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-gray-900">#{order.id}</p>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                        STATUS_STYLES[order.statusStep]
                      }`}
                    >
                      {order.statusLabel}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{order.itemsSummary}</p>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-green-800">฿{order.total.toLocaleString()}</p>
                  <p className="text-[11px] text-gray-400">{order.items.length} รายการ</p>
                </div>

                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}