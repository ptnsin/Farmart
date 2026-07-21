import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sprout,
  Search,
  ShoppingCart,
  UserCircle2,
  Truck,
  ShieldCheck,
  BadgeCheck,
  Star,
  Plus,
  Loader2,
} from "lucide-react";
import { useCart } from "./CartContext";
import { getProducts, toDisplayProduct } from "./data/productStore";
import { fetchCurrentUser, getCachedUser } from "./data/authStore";
import NotificationBell from "./NotificationBell";
import Footer from "./Footer";

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
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // รูปโปรไฟล์ผู้ใช้ปัจจุบัน (แสดงที่ไอคอนมุมขวาบน)
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    // โชว์รูปที่แคชไว้ก่อนทันที (ไม่ต้องรอ network) เหมือนหน้า Profile
    const cached = getCachedUser();
    if (cached?.avatar) setAvatar(cached.avatar);

    // แล้วค่อยยืนยัน/อัปเดตกับ backend
    fetchCurrentUser()
      .then((user) => {
        if (user?.avatar) setAvatar(user.avatar);
      })
      .catch(() => {
        // ยังไม่ได้ล็อกอิน หรือ token หมดอายุ — ใช้ไอคอนเริ่มต้นต่อไป ไม่ต้องแจ้ง error
      });
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getProducts()
      .then((data) => {
        if (cancelled) return;
        setProducts((data || []).map(toDisplayProduct));
        setLoadError("");
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err?.message || "โหลดสินค้าไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // "สินค้าขายดี" — best sellers by rating (falls back to newest-first order
  // from the API when ratings tie), capped to 8 so the grid stays tidy.
  const featured = useMemo(() => {
    return [...products]
      .sort((a, b) => (b.rating || 0) * (b.ratingCount || 0) - (a.rating || 0) * (a.ratingCount || 0))
      .slice(0, 8);
  }, [products]);

  function handleAddToCart(e, product) {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      subtitle: product.tag,
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
            <NotificationBell />
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
              title="โปรไฟล์"
              className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50 overflow-hidden"
            >
              {avatar ? (
                <img
                  src={avatar}
                  alt="โปรไฟล์"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserCircle2 className="w-6 h-6" />
              )}
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

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mb-3" />
            <p className="text-sm">กำลังโหลดสินค้า...</p>
          </div>
        ) : loadError ? (
          <div className="text-center py-12 text-sm text-red-500">{loadError}</div>
        ) : filteredFeatured.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-500">
            ไม่พบสินค้าที่ตรงกับ "{searchQuery.trim()}"
          </div>
        ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filteredFeatured.map((p) => (
            <Link
              to={`/product/${p.id}`}
              key={p.id}
              className="group border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow block"
            >
              <div className="relative aspect-square bg-gray-50">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={(e) => handleAddToCart(e, p)}
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
                <p className="text-sm font-bold text-gray-900">฿{p.price.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {p.ratingCount > 0 ? `${p.rating.toFixed(1)} (${p.ratingCount})` : "ยังไม่มีรีวิว"}
                </div>
              </div>
            </Link>
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

{/* Customer reviews */}
<section className="max-w-6xl mx-auto px-6 py-14">
  <div className="text-center mb-10">
    <span className="inline-block text-xs font-semibold tracking-widest text-green-700 bg-green-50 px-3 py-1 rounded-full mb-3">
      เสียงจากลูกค้าจริง
    </span>
    <h2 className="text-2xl font-bold text-gray-900">
      ลูกค้าพูดถึง Farmart ว่าอย่างไร
    </h2>
  </div>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {[
      {
        name: "นภัสสร ใจดี",
        comment: "สินค้าคุณภาพดีมาก ใช้แล้วได้ผลตามที่คาดหวัง แนะนำเลยค่ะ",
        rating: 5,
      },
      {
        name: "ธีรพงษ์ วงศ์สกุล",
        comment: "สั่งง่าย จัดส่งไว ผลผลิตสดใหม่ทุกครั้ง ประทับใจบริการมากครับ",
        rating: 5,
      },
      {
        name: "อรวรรณ ศรีสุข",
        comment: "ชอบที่เห็นแหล่งที่มาของสินค้าชัดเจน ซื้อแล้วอุ่นใจว่าได้ของคุณภาพจริง",
        rating: 4,
      },
    ].map((review, i) => (
      <div key={i} className="rounded-xl border border-gray-100 bg-white shadow-sm p-6">
        <div className="flex gap-0.5 mb-3">
          {Array.from({ length: 5 }).map((_, j) => (
            <Star
              key={j}
              className={`w-4 h-4 ${
                j < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"
              }`}
            />
          ))}
        </div>
        <p className="text-gray-600 text-sm leading-relaxed mb-4">"{review.comment}"</p>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-semibold">
            {review.name.charAt(0)}
          </div>
          <p className="font-medium text-sm text-gray-900">{review.name}</p>
        </div>
      </div>
    ))}
  </div>
</section>

<Footer />
    </div>
  );
}