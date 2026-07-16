import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  ClipboardCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  Check,
  X,
  Loader2,
} from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import { getCachedUser, fetchCurrentUser } from "../data/authStore";
import { getProducts, updateApproval } from "../data/productStore";

function StatCard({ label, value, icon: Icon, iconBg, iconColor }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className={`flex h-11 w-11 items-center justify-center rounded-full ${iconBg} ${iconColor}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs font-medium tracking-wide text-slate-400">{label}</p>
        <p className="text-2xl font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

export default function AdminProductApprovals() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(getCachedUser());
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [processingId, setProcessingId] = useState(null);
  // นับเฉพาะการอนุมัติ/ปฏิเสธที่ทำในเซสชันนี้ (ข้อมูลจริงไม่มี timestamp ระดับ "วันนี้" ให้คำนวณจากอดีตได้)
  const [approvedCount, setApprovedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);

  useEffect(() => {
    fetchCurrentUser()
      .then(setCurrentUser)
      .catch((err) => {
        if (err.message.includes("เข้าสู่ระบบ")) navigate("/");
      });
  }, [navigate]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getProducts({ approvalStatus: "pending" })
      .then((data) => {
        if (!cancelled) setProducts(data);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.message.includes("เข้าสู่ระบบ")) {
          navigate("/");
          return;
        }
        setLoadError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const filteredProducts = useMemo(() => {
    if (!query.trim()) return products;
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.farmer || "").toLowerCase().includes(q)
    );
  }, [products, query]);

  const handleDecision = async (id, approvalStatus) => {
    setProcessingId(id);
    try {
      await updateApproval(id, approvalStatus);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      if (approvalStatus === "approved") setApprovedCount((c) => c + 1);
      else setRejectedCount((c) => c + 1);
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const STATS = [
    {
      id: "pending",
      label: "รอตรวจสอบ",
      value: products.length,
      icon: Clock,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      id: "approved",
      label: "อนุมัติแล้ว (เซสชันนี้)",
      value: approvedCount,
      icon: CheckCircle2,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      id: "rejected",
      label: "ปฏิเสธแล้ว (เซสชันนี้)",
      value: rejectedCount,
      icon: XCircle,
      iconBg: "bg-rose-50",
      iconColor: "text-rose-600",
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto px-6 py-6 md:px-10">
        {loading && (
          <div className="mb-4 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
            กำลังโหลดรายการสินค้าที่รออนุมัติ...
          </div>
        )}
        {loadError && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {loadError}
          </div>
        )}

        {/* Top bar */}
        <div className="mb-8 flex items-center gap-4">
          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="ค้นหาด้วยชื่อสินค้า, SKU, หมวดหมู่ หรือผู้จำหน่าย..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <button
            type="button"
            aria-label="แจ้งเตือน"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:bg-slate-50"
          >
            <Bell size={18} />
          </button>
          <div className="flex items-center gap-3 rounded-full border border-slate-200 py-1.5 pl-1.5 pr-4">
            <img
              src={currentUser?.avatar || "https://i.pravatar.cc/64?img=12"}
              alt=""
              className="h-8 w-8 rounded-full object-cover"
            />
            <div className="leading-tight">
              <p className="text-sm font-medium text-slate-800">{currentUser?.name || "Admin"}</p>
              <p className="text-xs text-slate-400">{currentUser?.role || "Admin"}</p>
            </div>
          </div>
        </div>

        <div className="mb-8 flex items-center gap-2 text-emerald-700">
          <ClipboardCheck size={20} />
          <h1 className="text-2xl font-semibold text-slate-800">อนุมัติการจัดการสินค้า</h1>
        </div>
        <p className="-mt-6 mb-6 text-sm text-slate-400">
          ตรวจสอบสินค้าที่พนักงานเพิ่มเข้ามา (รออนุมัติจาก Admin) ก่อนเผยแพร่ในหน้าร้าน
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {STATS.map((s) => (
            <StatCard key={s.id} {...s} />
          ))}
        </div>

        <div className="mt-6 space-y-3">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="flex flex-col gap-4 rounded-xl border border-slate-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center"
            >
              <img
                src={p.image || "https://placehold.co/64x64/E2E8F0/475569?text=IMG"}
                alt=""
                className="h-16 w-16 shrink-0 rounded-lg object-cover"
              />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-slate-800">{p.name}</p>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                    {p.sku}
                  </span>
                  {p.lotCode && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                      {p.lotCode}
                    </span>
                  )}
                  <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-600">
                    <Package size={10} />
                    {p.category}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  ราคา ฿{Number(p.price).toLocaleString()} · สต็อกเริ่มต้น{" "}
                  {Number(p.stockUnits).toLocaleString()} {p.unit || "หน่วย"} · ผู้จำหน่าย{" "}
                  {p.farmer || "-"} · {p.location || "-"}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  จัดโดย {p.submittedBy?.name || "ไม่ทราบผู้จัด"}
                  {p.submittedAt &&
                    ` · ${new Date(p.submittedAt).toLocaleDateString("th-TH", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}`}
                </p>
                {p.description && (
                  <p className="mt-1 text-sm text-slate-600">{p.description}</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDecision(p.id, "rejected")}
                  disabled={processingId === p.id}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-rose-200 text-rose-500 hover:bg-rose-50 disabled:opacity-50"
                  aria-label="ปฏิเสธสินค้านี้"
                >
                  {processingId === p.id ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                </button>
                <button
                  type="button"
                  onClick={() => handleDecision(p.id, "approved")}
                  disabled={processingId === p.id}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                  aria-label="อนุมัติสินค้านี้"
                >
                  {processingId === p.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Check size={16} />
                  )}
                </button>
              </div>
            </div>
          ))}

          {!loading && filteredProducts.length === 0 && (
            <div className="rounded-xl border border-slate-100 bg-white p-10 text-center text-sm text-slate-400 shadow-sm">
              {products.length === 0
                ? "ไม่มีสินค้าที่รอตรวจสอบในขณะนี้"
                : "ไม่พบสินค้าที่ตรงกับคำค้นหา"}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}