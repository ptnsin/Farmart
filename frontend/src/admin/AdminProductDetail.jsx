import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Send, MapPin, Package, Pencil, Trash2, X } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import { getProductById, replyToReview, deleteReply, deleteReview } from "../data/productStore";

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
  const [replyingId, setReplyingId] = useState(null);
  const [editingId, setEditingId] = useState(null); // reviewId ที่กำลังแก้ไข/ตอบใหม่อยู่
  const [deletingReplyId, setDeletingReplyId] = useState(null);
  const [deletingReviewId, setDeletingReviewId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setProduct(undefined);
    setDrafts({});
    getProductById(id)
      .then((data) => {
        if (!cancelled) setProduct(data ?? null);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.message.includes("เข้าสู่ระบบ")) {
          navigate("/");
          return;
        }
        // ไม่พบสินค้า/error อื่น ๆ ถือว่าไม่พบสินค้า
        setProduct(null);
      });
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  const updateDraft = (reviewId, value) =>
    setDrafts((prev) => ({ ...prev, [reviewId]: value }));

  const startEdit = (review) => {
    setDrafts((prev) => ({ ...prev, [review.id]: review.reply || "" }));
    setEditingId(review.id);
  };

  const cancelEdit = (reviewId) => {
    setEditingId(null);
    setDrafts((prev) => ({ ...prev, [reviewId]: "" }));
  };

  const submitReply = async (reviewId) => {
    const text = (drafts[reviewId] || "").trim();
    if (!text) return;
    setReplyingId(reviewId);
    try {
      const updated = await replyToReview(product.id, reviewId, text);
      setProduct(updated);
      setDrafts((prev) => ({ ...prev, [reviewId]: "" }));
      setEditingId(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setReplyingId(null);
    }
  };

  const handleDeleteReply = async (reviewId) => {
    if (!window.confirm("ต้องการลบคำตอบนี้หรือไม่?")) return;
    setDeletingReplyId(reviewId);
    try {
      const updated = await deleteReply(product.id, reviewId);
      setProduct(updated);
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingReplyId(null);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("ต้องการลบรีวิวนี้หรือไม่? การลบไม่สามารถย้อนกลับได้")) return;
    setDeletingReviewId(reviewId);
    try {
      const updated = await deleteReview(product.id, reviewId);
      setProduct(updated);
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingReviewId(null);
    }
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
                      <div className="flex items-center gap-3">
                        <p className="text-xs text-slate-400">{review.date}</p>
                        <button
                          type="button"
                          onClick={() => handleDeleteReview(review.id)}
                          disabled={deletingReviewId === review.id}
                          aria-label="ลบรีวิวนี้"
                          className="text-slate-300 hover:text-rose-500 disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="mt-1">
                      <Stars value={review.rating} />
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{review.comment}</p>

                    {review.reply && editingId !== review.id && (
                      <div className="mt-3 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                        <div className="mb-0.5 flex items-center justify-between">
                          <p className="text-xs font-medium text-emerald-600">
                            คำตอบจากทีมงาน Farmart
                          </p>
                          <div className="flex items-center gap-2 text-emerald-500">
                            <button
                              type="button"
                              onClick={() => startEdit(review)}
                              aria-label="แก้ไขคำตอบ"
                              className="hover:text-emerald-700"
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteReply(review.id)}
                              disabled={deletingReplyId === review.id}
                              aria-label="ลบคำตอบ"
                              className="hover:text-rose-500 disabled:opacity-50"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                        {review.reply}
                      </div>
                    )}

                    {(!review.reply || editingId === review.id) && (
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
                          disabled={replyingId === review.id}
                          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                        >
                          <Send size={14} />
                          {replyingId === review.id
                            ? "กำลังส่ง..."
                            : editingId === review.id
                            ? "บันทึก"
                            : "ส่ง"}
                        </button>
                        {editingId === review.id && (
                          <button
                            type="button"
                            onClick={() => cancelEdit(review.id)}
                            aria-label="ยกเลิกการแก้ไข"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50"
                          >
                            <X size={14} />
                          </button>
                        )}
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