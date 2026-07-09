import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Send, MapPin, Package } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import { getProductById, replyToReview } from "./productStore";

function Stars({ value }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={14}
          className={n <= value ? "fill-amber-400 text-amber-400" : "text-slate-200"}
        />
      ))}
    </div>
  );
}

export default function AdminProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(undefined); // undefined = ยังโหลดไม่เสร็จ, null = ไม่พบสินค้า
  const [drafts, setDrafts] = useState({});

  useEffect(() => {
    setProduct(getProductById(id));
    setDrafts({});
  }, [id]);

  const updateDraft = (reviewId, value) =>
    setDrafts((prev) => ({ ...prev, [reviewId]: value }));

  const submitReply = (reviewId) => {
    const text = (drafts[reviewId] || "").trim();
    if (!text) return;
    const updated = replyToReview(product.id, reviewId, text);
    setProduct(updated);
    setDrafts((prev) => ({ ...prev, [reviewId]: "" }));
  };

  if (product === undefined) {
    return (
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto px-6 py-6 md:px-10">
          <p className="text-sm text-slate-400">กำลังโหลดข้อมูลสินค้า...</p>
        </main>
      </div>
    );
  }

  if (product === null) {
    return (
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto px-6 py-6 md:px-10">
          <button
            type="button"
            onClick={() => navigate("/admin/inventory")}
            className="mb-4 flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft size={16} />
            กลับไปคลังสินค้า
          </button>
          <div className="rounded-xl border border-slate-100 bg-white p-10 text-center text-sm text-slate-400 shadow-sm">
            ไม่พบสินค้าที่ต้องการ (รหัสอ้างอิง #{id})
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto px-6 py-6 md:px-10">
        <button
          type="button"
          onClick={() => navigate("/admin/inventory")}
          className="mb-4 flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft size={16} />
          กลับไปคลังสินค้า
        </button>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: product info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-400">
                    SKU: {product.sku} · รหัสอ้างอิง #{product.id}
                  </p>
                  <h1 className="mt-1 text-2xl font-semibold text-slate-800">{product.name}</h1>
                  <p className="mt-1 text-sm text-slate-500">{product.category}</p>
                </div>
                <p className="text-2xl font-semibold text-emerald-700">
                  ฿{product.price.toLocaleString()}
                </p>
              </div>

              <div className="mt-4 flex gap-3">
                {(product.images?.length ? product.images : [product.image]).map((src, i) => (
                  <img key={i} src={src} alt="" className="h-24 w-24 rounded-lg object-cover" />
                ))}
              </div>

              <p className="mt-4 text-sm leading-relaxed text-slate-600">{product.description}</p>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Package size={14} className="text-slate-400" />
                  คงเหลือ {product.stockUnits.toLocaleString()} {product.unit || "หน่วย"}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-slate-400" />
                  {product.farmer} · {product.location}
                </span>
              </div>
            </div>

            {/* Reviews */}
            <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-800">
                รีวิวจากลูกค้า ({product.reviews.length})
              </h2>

              {product.reviews.length === 0 && (
                <p className="mt-3 text-sm text-slate-400">ยังไม่มีรีวิวสำหรับสินค้านี้</p>
              )}

              <div className="mt-4 space-y-5">
                {product.reviews.map((review) => (
                  <div key={review.id} className="border-b border-slate-50 pb-5 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-800">{review.customer}</p>
                      <p className="text-xs text-slate-400">{review.date}</p>
                    </div>
                    <div className="mt-1">
                      <Stars value={review.rating} />
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{review.comment}</p>

                    {review.reply && (
                      <div className="mt-3 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                        <p className="mb-0.5 text-xs font-medium text-emerald-600">
                          คำตอบจากทีมงาน Farmart
                        </p>
                        {review.reply}
                      </div>
                    )}

                    {!review.reply && (
                      <div className="mt-3 flex items-center gap-2">
                        <input
                          value={drafts[review.id] || ""}
                          onChange={(e) => updateDraft(review.id, e.target.value)}
                          type="text"
                          placeholder="ตอบกลับรีวิวนี้..."
                          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                        />
                        <button
                          type="button"
                          onClick={() => submitReply(review.id)}
                          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                        >
                          <Send size={14} />
                          ส่ง
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: farm / meta info */}
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-800">ข้อมูลผู้จำหน่าย</h2>
              <p className="mt-3 text-sm text-slate-600">{product.farmer}</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                <MapPin size={12} />
                {product.location}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}