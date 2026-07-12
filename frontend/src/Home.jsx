import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sprout,
  Search,
  ShoppingCart,
  Bell,
  UserCircle2,
  Truck,
  ShieldCheck,
  BadgeCheck,
  Star,
  Plus,
} from "lucide-react";
import { useCart } from "./CartContext";
import Footer from "./Footer";

const featured = [
  {
    id: "mixed-seeds",
    name: "เมล็ดพันธุ์ผสม",
    price: 85,
    priceLabel: "฿85.00",
    rating: "4.8 (120)",
    image:
      "https://images.unsplash.com/photo-1635372638513-8a960010a0ff?q=80&w=600&auto=format&fit=crop",
    subtitle: "แหล่งที่มา: เชียงใหม่, ประเทศไทย",
  },
  {
    id: "seedling-kit",
    name: "ชุดปลูกกล้าไม้ระดับมืออาชีพ",
    price: 150,
    priceLabel: "฿150.00",
    rating: "4.9 (80)",
    image:
      "https://images.unsplash.com/photo-1741027911956-db63415dcedf?q=80&w=600&auto=format&fit=crop",
    subtitle: "แหล่งที่มา: เชียงราย, ประเทศไทย",
  },
  {
    id: "organic-fertilizer",
    name: "ปุ๋ยอินทรีย์ (5 กก.)",
    price: 1250,
    priceLabel: "฿1,250.00",
    rating: "4.7 (65)",
    image:
      "https://images.unsplash.com/photo-1457530378978-8bac673b8062?q=80&w=600&auto=format&fit=crop",
    subtitle: "แหล่งที่มา: สุพรรณบุรี, ประเทศไทย",
  },
  {
    id: "fresh-veg-set-2",
    name: "ผักสดจากไร่ ชุดที่ 2",
    price: 65,
    priceLabel: "฿65.00",
    rating: "4.9 (210)",
    image:
      "https://images.unsplash.com/photo-1567547981970-2a44cc30cf66?q=80&w=600&auto=format&fit=crop",
    subtitle: "แหล่งที่มา: นครปฐม, ประเทศไทย",
  },
];

const perks = [
  {
    icon: Truck,
    title: "จัดส่งรวดเร็ว",
    desc: "ส่งตรงจากไร่ถึงมือคุณภายใน 24-48 ชั่วโมง",
  },
  {
    icon: ShieldCheck,
    title: "รับประกันคุณภาพ",
    desc: "ผลผลิตทุกชิ้นผ่านการรับรองมาตรฐานเกษตรอินทรีย์",
  },
  {
    icon: BadgeCheck,
    title: "ผู้ผลิตที่ผ่านการยืนยัน",
    desc: "ตรวจสอบย้อนกลับแหล่งที่มาได้ทุกคำสั่งซื้อ",
  },
];

export default function Home() {
  const { addItem, itemCount } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  function handleAddToCart(product) {
    addItem({
      id: product.id,
      name: product.name,
      subtitle: product.subtitle,
      price: product.price,
      image: product.image,
    });
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    const query = searchQuery.trim();
    navigate(query ? `/products?search=${encodeURIComponent(query)}` : "/products");
  }

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredFeatured = normalizedQuery
    ? featured.filter((p) => p.name.toLowerCase().includes(normalizedQuery))
    : featured;

  return (
    <div className="min-h-screen w-full bg-white text-gray-900">
      {/* Top nav */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto flex items-center gap-6 px-6 py-3.5">
          <Link to="/home" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-md bg-green-800 flex items-center justify-center">
              <Sprout className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">Farmart</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600 font-medium">
            <Link to="/home" className="text-green-800 font-bold">หน้าแรก</Link>
            <Link to="/products" className="hover:text-green-800">สินค้า</Link>
            <Link to="/tracking" className="hover:text-green-800">ติดตามพัสดุ</Link>
            <Link to="/orders" className="hover:text-green-800">คำสั่งซื้อ</Link>
          </nav>

          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-xs ml-auto relative hidden sm:block"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาสินค้า..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
            />
          </form>

          <div className="flex items-center gap-1">
            <button className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50">
              <Bell className="w-5 h-5" />
            </button>
            <Link
              to="/cart"
              title="รถเข็นของคุณ"
              className="relative w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-green-700 text-white text-[10px] font-bold flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            <Link
              to="/profile"
              className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50"
            >
              <UserCircle2 className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1600&auto=format&fit=crop"
          alt="Farm field"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-green-950/90 via-green-950/60 to-green-950/20" />
        <div className="relative max-w-6xl mx-auto px-6 py-20">
          <span className="inline-block text-xs font-semibold tracking-widest text-green-300 bg-green-900/50 px-3 py-1 rounded-full mb-4">
            ผลผลิตใหม่ทุกสัปดาห์
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight max-w-lg mb-4">
            ยกระดับฟาร์มของคุณด้วยผลผลิตที่สดใหม่
          </h1>
          <p className="text-white/80 text-sm max-w-md mb-6 leading-relaxed">
            เชื่อมต่อกับเครือข่ายเกษตรกรผู้ผ่านการรับรอง เลือกซื้อเมล็ดพันธุ์
            อุปกรณ์ และผลผลิตคุณภาพสูงได้ในที่เดียว
          </p>
          <div className="flex items-center gap-3">
            <Link
              to="/products"
              className="bg-green-700 hover:bg-green-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              เลือกซื้อสินค้า
            </Link>
          </div>
        </div>
      </section>

      {/* Highlight strip */}
      <section className="max-w-6xl mx-auto px-6 -mt-10 relative z-10 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 flex items-center gap-4">
            <img
              src="https://images.unsplash.com/photo-1635372638513-8a960010a0ff?q=80&w=200&auto=format&fit=crop"
              alt="เมล็ดพันธุ์คุณภาพ"
              className="w-12 h-12 rounded-lg object-cover shrink-0"
            />
            <div>
              <p className="text-sm font-semibold text-gray-900">เมล็ดพันธุ์คุณภาพ</p>
              <p className="text-xs text-gray-500 mt-0.5">คัดสรรจากแหล่งปลูกโดยตรง</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 flex items-center gap-4">
            <img
              src="https://images.unsplash.com/photo-1635168708643-aa398019ca5b?q=80&w=200&auto=format&fit=crop"
              alt="อุปกรณ์การเกษตร"
              className="w-12 h-12 rounded-lg object-cover shrink-0"
            />
            <div>
              <p className="text-sm font-semibold text-gray-900">อุปกรณ์การเกษตร</p>
              <p className="text-xs text-gray-500 mt-0.5">เครื่องมือทันสมัยสำหรับทุกไร่</p>
            </div>
          </div>
          <div className="bg-gray-900 rounded-xl shadow-md p-4 flex items-center justify-between text-white">
            <div>
              <p className="text-sm font-semibold">ซื้อยกล็อต คุ้มกว่า</p>
              <p className="text-xs text-white/60 mt-0.5">ลดสูงสุด 20% เมื่อสั่งขั้นต่ำ</p>
            </div>
            <span className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-sm font-bold">
              %
            </span>
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section id="products" className="max-w-6xl mx-auto px-6 py-14">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {normalizedQuery ? `ผลการค้นหา "${searchQuery.trim()}"` : "สินค้าขายดี"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {normalizedQuery
                ? `พบ ${filteredFeatured.length} รายการที่ตรงกับคำค้นหา`
                : "สินค้าที่ลูกค้าเลือกซื้อมากที่สุดในเดือนนี้"}
            </p>
          </div>
          <Link to="/products" className="text-sm font-semibold text-green-700 hover:underline">
            ดูทั้งหมด
          </Link>
        </div>

        {filteredFeatured.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-500">
            ไม่พบสินค้าที่ตรงกับ "{searchQuery.trim()}"
          </div>
        ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filteredFeatured.map((p) => (
            <div
              key={p.name}
              className="group border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-square bg-gray-50">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => handleAddToCart(p)}
                  title="เพิ่มลงตะกร้า"
                  className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-green-800 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-green-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-800 leading-snug line-clamp-2 mb-1">
                  {p.name}
                </p>
                <p className="text-sm font-bold text-gray-900">{p.priceLabel}</p>
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {p.rating}
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </section>

      {/* Why Farmart */}
      <section id="about" className="bg-green-950 text-white">
        <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-2xl font-bold mb-6">ทำไมต้องเลือก Farmart?</h2>
            <div className="space-y-5">
              {perks.map((perk) => {
                const Icon = perk.icon;
                return (
                  <div key={perk.title} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-green-300" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{perk.title}</p>
                      <p className="text-white/60 text-sm mt-0.5">{perk.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="rounded-xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?q=80&w=900&auto=format&fit=crop"
              alt="Farmer holding soil"
              className="w-full h-72 object-cover"
            />
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-green-50">
        <div className="max-w-2xl mx-auto px-6 py-14 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            ร่วมเป็นส่วนหนึ่งของชุมชน Farmart
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            รับข่าวสารผลผลิตใหม่และโปรโมชั่นพิเศษก่อนใครทางอีเมล
          </p>
          <Link
            to="/profile"
            className="inline-block bg-green-900 hover:bg-green-800 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
          >
            สมัครสมาชิก
          </Link>
        </div>
      </section>

<Footer />
    </div>
  );
}