import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Sprout,
  Search,
  Heart,
  ShoppingCart,
  UserCircle2,
  LayoutGrid,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const CATEGORIES = [
  { key: "seeds", label: "เมล็ดพันธุ์ (Seeds)" },
  { key: "organic", label: "ปุ๋ยอินทรีย์ (Organic)" },
  { key: "tools", label: "เครื่องมือเกษตร (Tools)" },
];

const ORIGINS = ["เชียงใหม่", "ภาคเหนือ", "น่าน"];

const PRODUCTS = [
  {
    id: 1,
    name: "เมล็ดพันธุ์ผักสลัดออร์แกนิก",
    category: "seeds",
    tag: "PREMIUM SEEDS",
    badge: { label: "ขายดีที่สุด", tone: "green" },
    price: 250,
    oldPrice: 350,
    origin: "เชียงใหม่",
    rating: "4.9 (210)",
    image:
      "https://images.unsplash.com/photo-1508747703725-719777637510?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "ปุ๋ยน้ำหมักจุลินทรีย์เข้มข้น",
    category: "organic",
    tag: "FERTILIZERS",
    badge: { label: "Organic Certified", tone: "outline" },
    price: 490,
    origin: "ภาคเหนือ",
    rating: "4.8 (96)",
    image:
      "https://images.unsplash.com/photo-1620200423727-8127f75d7f53?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "ชุดเสียมสแตนเลสด้ามไม้โอ๊ค",
    category: "tools",
    tag: "PREMIUM TOOLS",
    badge: { label: "Best Seller", tone: "orange" },
    price: 1290,
    origin: "น่าน",
    rating: "4.9 (58)",
    image:
      "https://images.unsplash.com/photo-1617576683096-00fc8eecb3af?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "ดินผสมอินทรียวัตถุ (50L)",
    category: "organic",
    tag: "SOIL & SUBSTRATES",
    price: 180,
    origin: "เชียงใหม่",
    rating: "4.7 (140)",
    image:
      "https://images.unsplash.com/photo-1585123334904-845d60e97b29?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 5,
    name: "เครื่องตั้งเวลาหยดน้ำพลังงานแสงอาทิตย์",
    category: "tools",
    tag: "IRRIGATION",
    badge: { label: "Smart Farming", tone: "green" },
    price: 2450,
    origin: "ภาคเหนือ",
    rating: "4.8 (44)",
    image:
      "https://images.unsplash.com/photo-1625246335525-79f3f77bad0f?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 6,
    name: "เมล็ดพันธุ์ไมโครกรีนรวม",
    category: "seeds",
    tag: "ORGANIC SEEDS",
    price: 120,
    origin: "น่าน",
    rating: "4.9 (302)",
    image:
      "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 7,
    name: "เมล็ดพันธุ์แตงกวาญี่ปุ่น",
    category: "seeds",
    tag: "SEEDS",
    price: 95,
    origin: "เชียงใหม่",
    rating: "4.6 (77)",
    image:
      "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 8,
    name: "ปุ๋ยหมักมูลไส้เดือน (10 กก.)",
    category: "organic",
    tag: "FERTILIZERS",
    price: 320,
    origin: "ภาคเหนือ",
    rating: "4.8 (63)",
    image:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 9,
    name: "กรรไกรตัดกิ่งอเนกประสงค์",
    category: "tools",
    tag: "TOOLS",
    price: 450,
    origin: "น่าน",
    rating: "4.7 (91)",
    image:
      "https://images.unsplash.com/photo-1617396900799-f4ec2b43c7ae?q=80&w=600&auto=format&fit=crop",
  },
];

const PAGE_SIZE = 6;

function Badge({ badge }) {
  if (!badge) return null;
  const tones = {
    green: "bg-green-700 text-white",
    orange: "bg-orange-500 text-white",
    outline: "bg-white/90 text-green-800 border border-green-200",
  };
  return (
    <span
      className={`absolute top-3 left-3 text-[10px] font-semibold px-2 py-1 rounded-full shadow-sm ${
        tones[badge.tone] || tones.green
      }`}
    >
      {badge.label}
    </span>
  );
}

export default function Products() {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedOrigins, setSelectedOrigins] = useState([]);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [page, setPage] = useState(1);

  const toggleCategory = (key) => {
    setSelectedCategories((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
    );
    setPage(1);
  };

  const toggleOrigin = (origin) => {
    setSelectedOrigins((prev) =>
      prev.includes(origin) ? prev.filter((o) => o !== origin) : [...prev, origin]
    );
    setPage(1);
  };

  const filtered = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const matchCategory =
        selectedCategories.length === 0 || selectedCategories.includes(p.category);
      const matchOrigin =
        selectedOrigins.length === 0 || selectedOrigins.includes(p.origin);
      const matchPrice = p.price <= maxPrice;
      return matchCategory && matchOrigin && matchPrice;
    });
  }, [selectedCategories, selectedOrigins, maxPrice]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

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
            <Link to="/home" className="hover:text-green-800">
              แนะนำ
            </Link>
            <Link to="/products" className="text-green-800 font-semibold">
              ผลิตภัณฑ์
            </Link>
            <a href="#" className="hover:text-green-800">
              อุปกรณ์ครบชุด
            </a>
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
            <button className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50">
              <ShoppingCart className="w-5 h-5" />
            </button>
            <Link
              to="/dashboard"
              className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50"
            >
              <UserCircle2 className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar filters */}
        <aside className="w-full md:w-56 shrink-0 space-y-8">
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">หมวดหมู่</h3>
            <div className="space-y-2.5">
              {CATEGORIES.map((c) => (
                <label
                  key={c.key}
                  className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(c.key)}
                    onChange={() => toggleCategory(c.key)}
                    className="w-4 h-4 rounded border-gray-300 text-green-700 focus:ring-green-700"
                  />
                  {c.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">ช่วงราคา</h3>
            <input
              type="range"
              min={0}
              max={10000}
              step={50}
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(Number(e.target.value));
                setPage(1);
              }}
              className="w-full accent-green-700"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>฿0</span>
              <span>฿{maxPrice.toLocaleString()}{maxPrice >= 10000 ? "+" : ""}</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">แหล่งกำเนิด</h3>
            <div className="flex flex-wrap gap-2">
              {ORIGINS.map((o) => {
                const active = selectedOrigins.includes(o);
                return (
                  <button
                    key={o}
                    onClick={() => toggleOrigin(o)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                      active
                        ? "bg-green-700 text-white border-green-700"
                        : "bg-white text-gray-600 border-gray-200 hover:border-green-300"
                    }`}
                  >
                    {o}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Product list */}
        <section className="flex-1">
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-lg font-bold text-gray-900">รายการสินค้าทั้งหมด</h1>
            <select className="text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-700">
              <option>เรียงตาม: แนะนำ</option>
              <option>ราคา: ต่ำ - สูง</option>
              <option>ราคา: สูง - ต่ำ</option>
              <option>ยอดนิยม</option>
            </select>
          </div>

          {pageItems.length === 0 ? (
            <div className="border border-dashed border-gray-200 rounded-xl py-20 text-center text-gray-400 text-sm">
              ไม่พบสินค้าตามเงื่อนไขที่เลือก ลองปรับตัวกรองใหม่
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {pageItems.map((p) => (
                <div
                  key={p.id}
                  className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow group"
                >
                  <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge badge={p.badge} />
                    <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-gray-500 hover:text-red-500 shadow-sm">
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-3.5">
                    <p className="text-[11px] font-semibold text-green-700 tracking-wide mb-1">
                      {p.tag}
                    </p>
                    <p className="text-sm font-medium text-gray-800 leading-snug mb-1.5 line-clamp-2">
                      {p.name}
                    </p>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm font-bold text-gray-900">
                        ฿{p.price.toLocaleString()}
                      </span>
                      {p.oldPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          ฿{p.oldPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {p.rating}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    n === currentPage
                      ? "bg-green-900 text-white"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-10">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between gap-8">
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md bg-green-800 flex items-center justify-center">
                <Sprout className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-sm">AgriHarvest</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              แพลตฟอร์มเชื่อมต่อเกษตรกรและผู้บริโภคเพื่อผลผลิตที่ยั่งยืน
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
            <div>
              <p className="font-semibold text-gray-900 mb-2.5">Shipping</p>
              <ul className="space-y-2 text-gray-500 text-xs">
                <li><a href="#" className="hover:text-green-700">ติดตามพัสดุ</a></li>
                <li><a href="#" className="hover:text-green-700">นโยบายการจัดส่ง</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-2.5">Help</p>
              <ul className="space-y-2 text-gray-500 text-xs">
                <li><a href="#" className="hover:text-green-700">ศูนย์ช่วยเหลือ</a></li>
                <li><a href="#" className="hover:text-green-700">ติดต่อเรา</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-2.5">Legal</p>
              <ul className="space-y-2 text-gray-500 text-xs">
                <li><a href="#" className="hover:text-green-700">ข้อกำหนดการใช้งาน</a></li>
                <li><a href="#" className="hover:text-green-700">นโยบายความเป็นส่วนตัว</a></li>
              </ul>
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 pb-6">
          © 2024 AgriHarvest. Sustainable farming, delivered.
        </p>
      </footer>
    </div>
  );
}
