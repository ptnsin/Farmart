
import { useEffect, useMemo, useState } from "react";

import { Link, useNavigate } from "react-router-dom";
import {
  Sprout,
  Search,
  Heart,
  ShoppingCart,
  Bell,
  UserCircle2,
  Truck,
  Star,
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2,
} from "lucide-react";
import { getProducts, toDisplayProduct } from "./data/productStore";
import { useCart } from "./CartContext";

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
  const { addItem, itemCount } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedOrigins, setSelectedOrigins] = useState([]);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    // เฉพาะสินค้าที่ admin อนุมัติแล้วเท่านั้นที่แสดงหน้าร้าน
    getProducts({ approvalStatus: "approved" })
      .then((data) => {
        if (cancelled) return;
        setProducts(data.map(toDisplayProduct));
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || "โหลดสินค้าไม่สำเร็จ");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // สร้างตัวเลือกหมวดหมู่ / แหล่งกำเนิด จากข้อมูลสินค้าจริงที่โหลดมา
  const CATEGORIES = useMemo(() => {
    const seen = new Map();
    products.forEach((p) => {
      if (p.category && !seen.has(p.category)) seen.set(p.category, p.category);
    });
    return Array.from(seen.keys()).map((c) => ({ key: c, label: c }));
  }, [products]);

  const ORIGINS = useMemo(() => {
    const seen = new Set();
    products.forEach((p) => {
      if (p.origin) seen.add(p.origin);
    });
    return Array.from(seen);
  }, [products]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    const query = searchQuery.trim();
    navigate(query ? `/products?search=${encodeURIComponent(query)}` : "/products");
  }

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      subtitle: product.tag,
      price: product.price,
      image: product.image,
    });
  };

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
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchCategory =
        selectedCategories.length === 0 || selectedCategories.includes(p.category);
      const matchOrigin =
        selectedOrigins.length === 0 || selectedOrigins.includes(p.origin);
      const matchPrice = p.price <= maxPrice;
      const matchSearch = !q || p.name.toLowerCase().includes(q);
      return matchCategory && matchOrigin && matchPrice && matchSearch;
    });
  }, [products, selectedCategories, selectedOrigins, maxPrice, search]);

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
            <span className="font-bold text-gray-900">Farmart</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600 font-medium">
            <Link to="/home" className="hover:text-green-800">หน้าแรก</Link>
            <Link to="/products" className="hover:text-green-800">สินค้า</Link>
            <Link to="/tracking" className="hover:text-green-800">ติดตามพัสดุ</Link>
            <Link to="/orders" className="hover:text-green-800">คำสั่งซื้อ</Link>
            <Link to="/help-center" className="hover:text-green-800">ศูนย์ช่วยเหลือ</Link>
          </nav>

          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-xs ml-auto relative hidden sm:block"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"

              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}

              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาสินค้า..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
            />
          </form>

          <div className="flex items-center gap-1">
            <Link
              to="/tracking"
              title="ติดตามพัสดุ"
              className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50"
            >
              <Truck className="w-5 h-5" />
            </Link>
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

          {loading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin" />
              <p className="text-sm">กำลังโหลดสินค้า...</p>
            </div>
          ) : error ? (
            <div className="border border-dashed border-red-200 bg-red-50 rounded-xl py-16 text-center text-red-500 text-sm px-6">
              {error}
              <br />
              ตรวจสอบว่ารัน backend server อยู่หรือไม่
            </div>
          ) : pageItems.length === 0 ? (
            <div className="border border-dashed border-gray-200 rounded-xl py-20 text-center text-gray-400 text-sm">
              ไม่พบสินค้าตามเงื่อนไขที่เลือก ลองปรับตัวกรองใหม่
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {pageItems.map((p) => (
                <Link
                  to={`/product/${p.id}`}
                  key={p.id}
                  className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow group block"
                >
                  <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge badge={p.badge} />
                    <button
                      onClick={(e) => e.preventDefault()}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-gray-500 hover:text-red-500 shadow-sm"
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleAddToCart(e, p)}
                      title="เพิ่มลงตะกร้า"
                      className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-green-800 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4" />
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
                      {p.rating} ({p.ratingCount})
                    </div>
                  </div>
                </Link>
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
              <span className="font-bold text-gray-900 text-sm">Farmart</span>
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
          © 2024 Farmart. Sustainable farming, delivered.
        </p>
      </footer>
    </div>
  );
}
