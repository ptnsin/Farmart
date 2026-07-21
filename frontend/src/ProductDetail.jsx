import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Sprout,
  Search,
  ShoppingCart,
  UserCircle2,
  Star,
  Minus,
  Plus,
  Truck,
  ChevronRight,
  MessageSquare,
  ThumbsUp,
  BadgeCheck,
  Loader2,
} from "lucide-react";
import NotificationBell from "./NotificationBell";
import { getProductById, getProducts, toDisplayProduct, addReview } from "./data/productStore";
import { fetchCurrentUser, getCachedUser, isAuthenticated } from "./data/authStore";
import { getMyOrders } from "./data/orderStore";
import { useCart } from "./CartContext";
import Footer from "./Footer";

function Stars({ rating, size = "w-3.5 h-3.5" }) {
  const rounded = Math.round(rating);
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`${size} ${
            i < rounded ? "fill-amber-400 text-amber-400" : "text-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

// Builds a plausible rating distribution when the product has no explicit breakdown
function getRatingDistribution(rating) {
  if (rating >= 4.7) return [75, 18, 4, 2, 1];
  if (rating >= 4.3) return [60, 25, 9, 4, 2];
  if (rating >= 4.0) return [45, 30, 15, 7, 3];
  if (rating >= 3.5) return [32, 30, 20, 12, 6];
  return [20, 25, 25, 18, 12];
}

function ReviewCard({ review }) {
  return (
    <div className="border-b border-gray-100 pb-5">
      <div className="flex items-start gap-3">
        {review.avatar ? (
          <img
            src={review.avatar}
            alt={review.name}
            className="w-9 h-9 shrink-0 rounded-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextSibling.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className="w-9 h-9 shrink-0 rounded-full bg-green-100 text-green-800 font-bold items-center justify-center text-sm"
          style={{ display: review.avatar ? "none" : "flex" }}
        >
          {review.name.trim().charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-gray-800">{review.name}</p>
            {review.verified && (
              <span className="inline-flex items-center gap-1 text-[11px] text-green-700 font-medium">
                <BadgeCheck className="w-3.5 h-3.5" />
                ซื้อสินค้าแล้ว
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Stars rating={review.rating} />
            <span className="text-xs text-gray-400">{review.date}</span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed mt-2">
            {review.comment}
          </p>
          {review.reply && (
            <div className="mt-3 bg-green-50 border border-green-100 rounded-lg p-3">
              <p className="text-xs font-semibold text-green-800 mb-1">
                ตอบกลับจากร้านค้า
              </p>
              <p className="text-xs text-green-900 leading-relaxed">{review.reply}</p>
            </div>
          )}
          <button className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-green-700 mt-3">
            <ThumbsUp className="w-3.5 h-3.5" />
            มีประโยชน์ ({review.helpful})
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, itemCount } = useCart();

  // รูปโปรไฟล์ผู้ใช้ปัจจุบัน (แสดงที่ไอคอนมุมขวาบน)
  const [avatar, setAvatar] = useState(null);
  useEffect(() => {
    const cached = getCachedUser();
    if (cached?.avatar) setAvatar(cached.avatar);
    fetchCurrentUser()
      .then((user) => {
        if (user?.avatar) setAvatar(user.avatar);
      })
      .catch(() => {});
  }, []);

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [searchQuery, setSearchQuery] = useState("");

  // ฟอร์มเขียนรีวิว
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [myRating, setMyRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const loggedIn = isAuthenticated();
  const currentUserId = getCachedUser()?.id;

  const [hasPurchased, setHasPurchased] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(false);

  // เช็คว่าผู้ใช้ปัจจุบันเคยสั่งซื้อสินค้าชิ้นนี้แล้วหรือยัง (เขียนรีวิวได้เฉพาะคนที่ซื้อแล้วเท่านั้น)
  useEffect(() => {
    if (!product || !loggedIn) {
      setHasPurchased(false);
      return;
    }
    let cancelled = false;
    setCheckingPurchase(true);
    getMyOrders()
      .then((orders) => {
        if (cancelled) return;
        const purchased = orders.some(
          (o) =>
            o.status !== "rejected" &&
            (o.items || []).some((it) => String(it.productId) === String(product.id))
        );
        setHasPurchased(purchased);
      })
      .catch(() => {
        if (!cancelled) setHasPurchased(false);
      })
      .finally(() => {
        if (!cancelled) setCheckingPurchase(false);
      });
    return () => {
      cancelled = true;
    };
  }, [product?.id, loggedIn]);

  const alreadyReviewed =
    loggedIn &&
    (product?.reviews || []).some((r) => Number(r.userId) === Number(currentUserId));

  function handleToggleReviewForm() {
    setReviewError("");
    setReviewSuccess(false);
    setShowReviewForm((v) => !v);
  }

  async function handleSubmitReview(e) {
    e.preventDefault();
    if (myRating < 1) {
      setReviewError("กรุณาเลือกจำนวนดาวก่อนส่งรีวิว");
      return;
    }
    setReviewError("");
    setSubmittingReview(true);
    try {
      const updated = await addReview(product.id, {
        rating: myRating,
        comment: myComment.trim(),
      });
      setProduct(toDisplayProduct(updated));
      setMyRating(0);
      setMyComment("");
      setShowReviewForm(false);
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (err) {
      setReviewError(err.message || "ส่งรีวิวไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSubmittingReview(false);
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    const query = searchQuery.trim();
    navigate(query ? `/products?search=${encodeURIComponent(query)}` : "/products");
  }

  const detailsRef = useRef(null);
  const reviewsRef = useRef(null);
  const relatedRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    window.scrollTo(0, 0);
    setActiveImage(0);
    setSelectedSize(0);
    setQuantity(1);
    setAdded(false);
    setActiveTab("details");
    setLoading(true);
    setError("");
    setProduct(null);
    setRelated([]);

    getProductById(id)
      .then((raw) => {
        if (cancelled) return;
        const display = toDisplayProduct(raw);
        setProduct(display);
        // โหลดสินค้าที่เกี่ยวข้อง (หมวดหมู่เดียวกัน, อนุมัติแล้ว) แยกอีก request
        return getProducts({ category: raw.category, approvalStatus: "approved" }).then(
          (list) => {
            if (cancelled) return;
            setRelated(
              list
                .filter((p) => String(p.id) !== String(display.id))
                .slice(0, 4)
                .map(toDisplayProduct)
            );
          }
        );
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || "ไม่พบสินค้านี้");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const scrollToSection = (key, ref) => {
    setActiveTab(key);
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center gap-3 bg-white text-gray-900">
        <Loader2 className="w-6 h-6 animate-spin text-green-700" />
        <p className="text-sm text-gray-400">กำลังโหลดข้อมูลสินค้า...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center gap-4 bg-white text-gray-900">
        <p className="text-lg font-semibold">{error || "ไม่พบสินค้านี้"}</p>
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
  const reviews = product.reviews || [];
  const ratingDistribution = getRatingDistribution(product.rating);

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
            <span className="font-bold text-gray-900">Farmart</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600 font-medium">
            <Link to="/home" className="hover:text-green-800">หน้าแรก</Link>
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
                <img src={avatar} alt="โปรไฟล์" className="w-full h-full object-cover" />
              ) : (
                <UserCircle2 className="w-6 h-6" />
              )}
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
            <div className="mb-5">
              <button
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center gap-2 bg-green-900 hover:bg-green-800 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                {added ? "เพิ่มลงตะกร้าแล้ว ✓" : "เพิ่มลงตะกร้า"}
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

        {/* Section tabs */}
        <div className="sticky top-[57px] z-10 bg-white border-b border-gray-100 mt-14">
          <div className="flex items-center gap-8">
            <button
              onClick={() => scrollToSection("details", detailsRef)}
              className={`py-3.5 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "details"
                  ? "text-green-800 border-green-700"
                  : "text-gray-500 border-transparent hover:text-gray-800"
              }`}
            >
              รายละเอียดสินค้า
            </button>
            <button
              onClick={() => scrollToSection("reviews", reviewsRef)}
              className={`py-3.5 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "reviews"
                  ? "text-green-800 border-green-700"
                  : "text-gray-500 border-transparent hover:text-gray-800"
              }`}
            >
              รีวิว ({product.ratingCount})
            </button>
            <button
              onClick={() => scrollToSection("related", relatedRef)}
              className={`py-3.5 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "related"
                  ? "text-green-800 border-green-700"
                  : "text-gray-500 border-transparent hover:text-gray-800"
              }`}
            >
              สินค้าที่เกี่ยวข้อง
            </button>
          </div>
        </div>

        {/* Description + Specs */}
        <div
          ref={detailsRef}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10 scroll-mt-28"
        >
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

        {/* Reviews */}
        <div ref={reviewsRef} className="mt-16 scroll-mt-28">
          <h2 className="text-lg font-bold text-gray-900 mb-5">
            รีวิวจากลูกค้า
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Rating summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <p className="text-4xl font-bold text-gray-900">
                  {product.rating}
                </p>
                <div className="flex justify-center my-2">
                  <Stars rating={product.rating} size="w-4 h-4" />
                </div>
                <p className="text-sm text-gray-500">
                  จาก {product.ratingCount} รีวิว
                </p>
              </div>
              <div className="mt-4 space-y-2">
                {ratingDistribution.map((pct, i) => {
                  const starLabel = 5 - i;
                  return (
                    <div key={starLabel} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-8 shrink-0">
                        {starLabel} ดาว
                      </span>
                      <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-8 text-right shrink-0">
                        {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>
              {alreadyReviewed ? (
                <p className="mt-5 text-xs text-center text-green-700 bg-green-50 border border-green-100 rounded-lg py-2.5 px-3">
                  ✓ คุณได้รีวิวสินค้านี้แล้ว ขอบคุณสำหรับความคิดเห็น
                </p>
              ) : (
                <button
                  onClick={handleToggleReviewForm}
                  disabled={checkingPurchase}
                  className="w-full mt-5 flex items-center justify-center gap-2 border border-gray-200 text-gray-700 font-semibold text-sm py-2.5 rounded-lg hover:border-green-300 hover:text-green-700 transition-colors disabled:opacity-60"
                >
                  <MessageSquare className="w-4 h-4" />
                  {showReviewForm ? "ยกเลิก" : "เขียนรีวิว"}
                </button>
              )}

              {reviewSuccess && (
                <p className="mt-3 text-xs text-center text-green-700 bg-green-50 border border-green-100 rounded-lg py-2">
                  ขอบคุณสำหรับรีวิว! 🎉
                </p>
              )}

              {showReviewForm && !alreadyReviewed && (
                <div className="mt-4 bg-gray-50 border border-gray-100 rounded-xl p-4">
                  {!loggedIn ? (
                    <div className="text-center py-2">
                      <p className="text-sm text-gray-600 mb-3">
                        กรุณาเข้าสู่ระบบก่อนเพื่อเขียนรีวิวสินค้า
                      </p>
                      <Link
                        to="/"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 hover:underline"
                      >
                        ไปหน้าเข้าสู่ระบบ
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ) : !hasPurchased ? (
                    <div className="text-center py-2">
                      <p className="text-sm text-gray-600 mb-1">
                        คุณต้องสั่งซื้อสินค้านี้ก่อนถึงจะเขียนรีวิวได้
                      </p>
                      <p className="text-xs text-gray-400 mb-3">
                        รีวิวได้หลังจากสั่งซื้อสินค้าชิ้นนี้เรียบร้อยแล้ว
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setShowReviewForm(false);
                          handleAddToCart();
                        }}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 hover:underline"
                      >
                        เพิ่มลงตะกร้าเลย
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitReview} className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-1.5">
                          ให้คะแนนสินค้านี้
                        </p>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }, (_, i) => {
                            const value = i + 1;
                            const filled = value <= (hoverRating || myRating);
                            return (
                              <button
                                type="button"
                                key={value}
                                onClick={() => setMyRating(value)}
                                onMouseEnter={() => setHoverRating(value)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="p-0.5"
                                aria-label={`${value} ดาว`}
                              >
                                <Star
                                  className={`w-6 h-6 transition-colors ${
                                    filled
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="review-comment"
                          className="text-xs font-semibold text-gray-700 mb-1.5 block"
                        >
                          ความคิดเห็น (ไม่บังคับ)
                        </label>
                        <textarea
                          id="review-comment"
                          value={myComment}
                          onChange={(e) => setMyComment(e.target.value)}
                          rows={3}
                          maxLength={500}
                          placeholder="บอกเล่าประสบการณ์การใช้สินค้านี้..."
                          className="w-full text-sm rounded-lg border border-gray-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 resize-none"
                        />
                      </div>

                      {reviewError && (
                        <p className="text-xs text-red-600">{reviewError}</p>
                      )}

                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="w-full flex items-center justify-center gap-2 bg-green-700 text-white font-semibold text-sm py-2.5 rounded-lg hover:bg-green-800 transition-colors disabled:opacity-60"
                      >
                        {submittingReview && (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        )}
                        ส่งรีวิว
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* Review list */}
            <div className="lg:col-span-2 space-y-5">
              {reviews.length === 0 ? (
                <p className="text-sm text-gray-400 py-6 text-center border border-dashed border-gray-200 rounded-xl">
                  ยังไม่มีรีวิวสำหรับสินค้านี้ เป็นคนแรกที่รีวิวสิ!
                </p>
              ) : (
                reviews.map((r, i) => (
                  <ReviewCard key={r.id ?? `${r.name}-${i}`} review={r} />
                ))
              )}
              {reviews.length > 0 && (
                <button className="text-sm font-semibold text-green-700 hover:underline">
                  ดูรีวิวทั้งหมด
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div ref={relatedRef} className="mt-16 scroll-mt-28">
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
                  to={`/product/${p.id}`}
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

      <Footer />
    </div>
  );
}