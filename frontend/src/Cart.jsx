import { Link, useNavigate } from "react-router-dom";
import {
  Sprout,
  Search,
  Heart,
  ShoppingCart,
  UserCircle2,
  LayoutGrid,
  Minus,
  Plus,
  Trash2,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { useCart } from "./CartContext";

const SHIPPING_FEE = 150;
const TAX_RATE = 0.07;

export default function Cart() {
  const { items, updateQuantity, removeItem, itemCount, subtotal } = useCart();
  const navigate = useNavigate();

  const shipping = items.length === 0 ? 0 : SHIPPING_FEE;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen w-full bg-white text-gray-900">
      {/* Top nav */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto flex items-center gap-6 px-6 py-3.5">
          <Link to="/home" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-md bg-green-800 flex items-center justify-center">
              <Sprout className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">AgriHarvest</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600 font-medium">
            <Link to="/home" className="hover:text-green-800">แนะนำ</Link>
            <Link to="/products" className="hover:text-green-800">ผลิตภัณฑ์</Link>
            <a href="#" className="hover:text-green-800">อุปกรณ์ครบชุด</a>
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
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50">
              <Heart className="w-5 h-5" />
            </button>
            <Link
              to="/cart"
              className="relative w-9 h-9 flex items-center justify-center rounded-lg bg-green-50 text-green-700"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-green-700 text-white text-[10px] font-bold flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            <Link
              to="/dashboard"
              className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50"
            >
              <UserCircle2 className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-xl font-bold text-gray-900 mb-6">รถเข็นของคุณ</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {items.length === 0 ? (
              <div className="border border-dashed border-gray-200 rounded-xl py-16 text-center text-gray-400 text-sm">
                รถเข็นของคุณว่างเปล่า
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.key}
                  className="border border-gray-100 rounded-xl p-4 flex items-center gap-4"
                >
                  <div className="w-16 h-16 rounded-lg bg-gray-50 flex items-center justify-center text-3xl overflow-hidden shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      item.emoji || "🌱"
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-1">
                      {item.name}
                    </p>
                    {item.subtitle && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                        {item.subtitle}
                      </p>
                    )}
                    <p className="text-sm font-bold text-gray-900 mt-1.5">
                      ฿{item.price.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center border border-gray-200 rounded-lg shrink-0">
                    <button
                      onClick={() => updateQuantity(item.key, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.key, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.key)}
                    title="ลบสินค้า"
                    className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}

            {/* Add more products */}
            <div className="border border-dashed border-gray-200 rounded-xl py-10 text-center">
              <p className="text-sm font-semibold text-gray-800 mb-1">
                เพิ่มสินค้าเพิ่มเติม?
              </p>
              <p className="text-xs text-gray-500 mb-4">
                เลือกชมสินค้าคุณภาพจากเกษตรกรทั่วประเทศ
              </p>
              <Link
                to="/products"
                className="inline-block text-sm font-semibold text-white bg-green-800 hover:bg-green-900 px-5 py-2.5 rounded-lg transition-colors"
              >
                กลับไปเลือกซื้อสินค้า
              </Link>
            </div>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="border border-gray-100 rounded-xl p-5 sticky top-20">
              <h2 className="text-sm font-bold text-gray-900 mb-4">
                สรุปคำสั่งซื้อ
              </h2>

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>ยอดรวมสินค้า</span>
                  <span className="font-medium text-gray-900">
                    ฿{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>ค่าจัดส่ง</span>
                  <span className="font-medium text-gray-900">
                    {shipping === 0 ? "ฟรี" : `฿${shipping.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>ภาษี (7%)</span>
                  <span className="font-medium text-gray-900">
                    ฿{tax.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 my-4" />

              <div className="flex justify-between items-baseline mb-5">
                <span className="text-sm font-bold text-gray-900">รวมสุทธิ</span>
                <span className="text-lg font-bold text-green-800">
                  ฿{total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </div>

              <button
                disabled={items.length === 0}
                onClick={() => navigate("/tracking")}
                className="w-full flex items-center justify-center gap-2 bg-green-800 hover:bg-green-900 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold py-3 rounded-lg transition-colors"
              >
                ดำเนินการชำระเงิน
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-start gap-2 mt-4 text-xs text-gray-400">
                <ShieldCheck className="w-4 h-4 text-green-700 mt-0.5 shrink-0" />
                <span>การชำระเงินของคุณปลอดภัยและได้รับการเข้ารหัส</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-16 bg-green-950">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between gap-8">
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md bg-green-700 flex items-center justify-center">
                <Sprout className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-white text-sm">AgriHarvest</span>
            </div>
            <p className="text-xs text-white/60 leading-relaxed">
              เกษตรกรรมยั่งยืนที่ส่งตรงถึงมือคุณ
            </p>
          </div>
          <div className="grid grid-cols-3 gap-8 text-sm">
            <div>
              <p className="font-semibold text-white/80 mb-2.5 text-xs">Sustainability</p>
            </div>
            <div>
              <p className="font-semibold text-white/80 mb-2.5 text-xs">Wholesale</p>
            </div>
            <div>
              <p className="font-semibold text-white/80 mb-2.5 text-xs">Privacy Policy</p>
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-white/40 pb-6">
          © 2024 AgriHarvest. Cultivated trust through transparency.
        </p>
      </footer>
    </div>
  );
}
