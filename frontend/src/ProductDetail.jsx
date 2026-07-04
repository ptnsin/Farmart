import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Sprout,
  Search,
  Heart,
  ShoppingCart,
  UserCircle2,
  LayoutGrid,
  Star,
  Minus,
  Plus,
  Truck,
  ChevronRight,
} from "lucide-react";
import { PRODUCTS, getProductById } from "./productsData";
import { useCart } from "./CartContext";

function Stars({ rating }) {
  const rounded = Math.round(rating);
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i < rounded ? "fill-amber-400 text-amber-400" : "text-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, itemCount } = useCart();
  const product = getProductById(id);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveImage(0);
    setSelectedSize(0);
    setQuantity(1);
    setAdded(false);
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center gap-4 bg-white text-gray-900">
        <p className="text-lg font-semibold">ไม่พบสินค้านี้</p>
        <Link
          to="/products"
          className="text-sm font-semibold text-green-700 hover:underline"
        >
          กลับไปหน้าสินค้าทั้งหมด
        </Link>
      </div>
    );
  }

  const gallery = product.gallery?.length ? product.gallery : [product.image];
  const currentPrice = product.sizes?.[selectedSize]?.price ?? product.price;
  const related = PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  const handleAddToCart = () => {
    const sizeLabel = product.sizes?.[selectedSize]?.label;
    addItem(
      {
        id: product.id,
        name: product.name,
        subtitle: sizeLabel || product.tag,
        price: currentPrice,
        image: product.image,
        variant: sizeLabel,
      },
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

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
            <Link to="/products" className="text-green-800 font-semibold">ผลิตภัณฑ์</Link>
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
              to="/dashboard"
              className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50"
            >
              <UserCircle2 className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
          <Link to="/home" className="hover:text-green-700">หน้าแรก</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/products" className="hover:text-green-700">สินค้า</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-600 line-clamp-1">{product.name}</span>
        </div>

        {/* Main product section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Gallery */}
          <div>
            <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden mb-3">
              <img
                src={gallery[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {gallery.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {gallery.map((img, i) => (
                  <button
                    key={img}
                    onClick={() => setActiveImage(i)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      i === activeImage ? "border-green-700" : "border-transparent"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <p className="text-[11px] font-semibold text-green-700 tracking-widest mb-2">
              {product.tag}
            </p>
            <h1 className="text-2xl font-bold text-gray-900 leading-snug mb-2">
              {product.name}
            </h1>
            <div className="flex items-center gap-2 mb-5">
              <Stars rating={product.rating} />
              <span className="text-sm text-gray-500">
                {product.rating} ({product.ratingCount} รีวิว)
              </span>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-5">
              <p className="text-xs text-gray-400 mb-1">ราคา</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">
                  ฿{currentPrice.toLocaleString()}
                </span>
                {product.oldPrice && selectedSize === 0 && (
                  <span className="text-sm text-gray-400 line-through">
                    ฿{product.oldPrice.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {product.sizes && product.sizes.length > 1 && (
              <div className="mb-5">
                <p className="text-sm font-semibold text-gray-800 mb-2">
                  เลือกขนาด (บังคับเลือก)
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s, i) => (
                    <button
                      key={s.label}
                      onClick={() => setSelectedSize(i)}
                      className={`text-xs font-medium px-3.5 py-2 rounded-lg border transition-colors ${
                        i === selectedSize
                          ? "bg-green-700 text-white border-green-700"
                          : "bg-white text-gray-600 border-gray-200 hover:border-green-300"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-5">
              <span className="text-sm font-semibold text-gray-800">จำนวน</span>
              <div className="flex items-center border border-gray-200 rounded-lg">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center text-sm font-semibold">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-sm font-bold text-gray-900 ml-auto">
                รวม ฿{(currentPrice * quantity).toLocaleString()}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mb-5">
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 bg-green-900 hover:bg-green-800 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                {added ? "เพิ่มลงตะกร้าแล้ว ✓" : "เพิ่มลงตะกร้า"}
              </button>
              <button className="w-12 h-12 shrink-0 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 hover:text-red-500 hover:border-red-200">
                <Heart className="w-5 h-5" />
              </button>
            </div>

            {/* Delivery info */}
            <div className="flex items-start gap-3 bg-green-50 border border-green-100 rounded-lg p-3.5">
              <Truck className="w-4 h-4 text-green-700 mt-0.5 shrink-0" />
              <div className="text-xs text-gray-600 leading-relaxed">
                <p className="font-semibold text-green-800">
                  จัดส่งฟรี เมื่อสั่งซื้อครบ ฿500
                </p>
                <p>จัดส่งจากแหล่งผลิตในจังหวัด{product.origin} ถึงบ้านคุณภายใน 1-3 วันทำการ</p>
              </div>
            </div>
          </div>
        </div>

        {/* Description + Specs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-14">
          <div className="lg:col-span-2">
            <h2 className="font-bold text-gray-900 mb-3">รายละเอียดสินค้า</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-8">
              {product.description}
            </p>

            {product.care?.length > 0 && (
              <>
                <h2 className="font-bold text-gray-900 mb-3">คำแนะนำการใช้งาน</h2>
                <div className="space-y-3">
                  {product.care.map((c) => (
                    <div
                      key={c.title}
                      className="flex items-start gap-3 bg-gray-50 rounded-lg p-3.5"
                    >
                      <span className="w-6 h-6 shrink-0 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold mt-0.5">
                        ✓
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {c.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                          {c.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {product.specs && (
            <div className="bg-gray-50 rounded-xl p-5 h-fit">
              <h3 className="font-bold text-gray-900 mb-4 text-sm">
                ข้อมูลจำเพาะ
              </h3>
              <dl className="space-y-3">
                {Object.entries(product.specs).map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-3 text-xs">
                    <dt className="text-gray-400">{label}</dt>
                    <dd className="text-gray-800 font-medium text-right">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-16">
            <div className="flex items-end justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">สินค้าที่เกี่ยวข้อง</h2>
                <p className="text-sm text-gray-500 mt-1">
                  สินค้าในหมวดหมู่เดียวกันที่คุณอาจสนใจ
                </p>
              </div>
              <Link
                to="/products"
                className="text-sm font-semibold text-green-700 hover:underline"
              >
                ดูทั้งหมด
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((p) => (
                <Link
                  key={p.id}
                  to={`/products/${p.id}`}
                  className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow block"
                >
                  <div className="aspect-square bg-gray-50 overflow-hidden">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-800 leading-snug line-clamp-2 mb-1">
                      {p.name}
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      ฿{p.price.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {p.rating}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-16">
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
