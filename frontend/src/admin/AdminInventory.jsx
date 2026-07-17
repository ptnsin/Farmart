import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  RefreshCw,
  AlertTriangle,
  Camera,
  RotateCw,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Pencil,
  Trash2,
} from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import AlertModal from "./AlertModal";
import { getProducts, deleteProduct } from "../data/productStore";
import { getCachedUser, fetchCurrentUser } from "../data/authStore";

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function StatCard({ label, value, note, noteColor, icon: Icon, iconBg, iconColor }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className={`flex h-11 w-11 items-center justify-center rounded-full ${iconBg} ${iconColor}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs font-medium tracking-wide text-slate-400">{label}</p>
        <p className={`font-semibold text-slate-800 ${value === "ทุกอย่างปกติ" ? "text-base" : "text-2xl"}`}>
          {value}
        </p>
        {note && <p className={`text-xs ${noteColor}`}>{note}</p>}
      </div>
    </div>
  );
}

/** สร้างรายการเลขหน้าแบบมี ... คั่นเมื่อจำนวนหน้าเยอะ */
function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  return Array.from(pages)
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
}

export default function AdminInventory() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [currentUser, setCurrentUser] = useState(getCachedUser());
  const [selected, setSelected] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pageSizeMenuOpen, setPageSizeMenuOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterCategories, setFilterCategories] = useState([]); // string[]
  const [filterStockLevel, setFilterStockLevel] = useState(""); // "" | "healthy" | "low"
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name } | null
  const [deleting, setDeleting] = useState(false);
  const [resultAlert, setResultAlert] = useState(null); // { type, message } | null

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getProducts({ approvalStatus: "approved" })
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

  useEffect(() => {
    fetchCurrentUser()
      .then(setCurrentUser)
      .catch((err) => {
        if (err.message.includes("เข้าสู่ระบบ")) navigate("/");
      });
  }, [navigate]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (!e.target.closest("[data-page-size-menu]")) setPageSizeMenuOpen(false);
      if (!e.target.closest("[data-filter-menu]")) setFilterOpen(false);
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const categoryOptions = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))).sort((a, b) => a.localeCompare(b, "th")),
    [products]
  );

  const filteredProducts = useMemo(() => {
    let result = products;

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.farmer.toLowerCase().includes(q)
      );
    }

    if (filterCategories.length > 0) {
      result = result.filter((p) => filterCategories.includes(p.category));
    }

    if (filterStockLevel) {
      result = result.filter((p) => p.stockLevel === filterStockLevel);
    }

    return result;
  }, [products, query, filterCategories, filterStockLevel]);

  const activeFilterCount = filterCategories.length + (filterStockLevel ? 1 : 0);

  const toggleCategoryFilter = (category) => {
    setPage(1);
    setFilterCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const clearFilters = () => {
    setPage(1);
    setFilterCategories([]);
    setFilterStockLevel("");
  };

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + pageSize);

  const allSelected =
    paginatedProducts.length > 0 && paginatedProducts.every((p) => selected.includes(p.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelected((prev) => prev.filter((id) => !paginatedProducts.some((p) => p.id === id)));
    } else {
      setSelected((prev) => [...new Set([...prev, ...paginatedProducts.map((p) => p.id)])]);
    }
  };

  const toggleOne = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const stats = useMemo(() => {
    const total = products.length;
    const lowCount = products.filter((p) => p.stockLevel === "low").length;
    const criticalCount = products.filter((p) => p.stockLevel === "low" && p.stockPercent <= 8).length;
    const inventoryValue = products.reduce((sum, p) => sum + p.price * p.stockUnits, 0);

    return [
      {
        id: "total",
        label: "สินค้าทั้งหมด",
        value: total.toLocaleString(),
        note: "รายการในระบบ",
        icon: RefreshCw,
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-600",
        noteColor: "text-emerald-600",
      },
      {
        id: "low",
        label: "สินค้าใกล้หมด",
        value: lowCount.toLocaleString(),
        note: `${criticalCount} รายการวิกฤต`,
        icon: AlertTriangle,
        iconBg: "bg-amber-50",
        iconColor: "text-amber-600",
        noteColor: "text-rose-500",
      },
      {
        id: "value",
        label: "มูลค่าสินค้าคงคลัง",
        value: `฿${inventoryValue.toLocaleString()}`,
        note: "",
        icon: Camera,
        iconBg: "bg-slate-100",
        iconColor: "text-slate-500",
        noteColor: "text-slate-400",
      },
      {
        id: "status",
        label: "สถานะการสั่งซื้อ",
        value: lowCount > 0 ? "มีสินค้าใกล้หมด" : "ทุกอย่างปกติ",
        note: "",
        icon: RotateCw,
        iconBg: "bg-slate-100",
        iconColor: "text-slate-500",
        noteColor: "text-slate-400",
      },
    ];
  }, [products]);

  const goToProduct = (id) => navigate(`/admin/inventory/${id}`);

  const handleDeleteProduct = (id, name) => {
    setDeleteTarget({ id, name });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const { id, name } = deleteTarget;
    setDeleting(true);
    try {
      const remaining = await deleteProduct(id);
      setProducts(remaining);
      setSelected((prev) => prev.filter((x) => x !== id));
      setDeleteTarget(null);
      setResultAlert({ type: "success", message: `ลบสินค้า "${name}" เรียบร้อยแล้ว` });
    } catch (err) {
      if (err.message.includes("เข้าสู่ระบบ")) {
        navigate("/");
        return;
      }
      setDeleteTarget(null);
      setResultAlert({ type: "error", message: err.message || "ลบสินค้าไม่สำเร็จ กรุณาลองใหม่" });
    } finally {
      setDeleting(false);
    }
  };

  const handleRowClick = (e, id) => {
    if (e.target.closest("input, button, a")) return;
    goToProduct(id);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto px-6 py-6 md:px-10">
        {loading && (
          <div className="mb-4 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
            กำลังโหลดข้อมูลสินค้า...
          </div>
        )}
        {loadError && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {loadError}
          </div>
        )}

        {/* Top bar */}
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={query}
              onChange={(e) => {
                setPage(1);
                setQuery(e.target.value);
              }}
              type="text"
              placeholder="ค้นหาสินค้าด้วยชื่อ, SKU, หมวดหมู่ หรือผู้จำหน่าย..."
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

        {/* Breadcrumb */}
        <p className="text-xs text-slate-400">แดชบอร์ด &gt; คลังสินค้า</p>

        {/* Heading */}
        <div className="mt-1 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">รายการสินค้าทั้งหมด</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-400">
              จัดการเกษตรกิจติดตามสินค้าคงคลัง เครื่องมือ และปุ๋ย ปรับปรุงราคา ติดตามระดับการเก็บ
              และจัดระเบียบหมวดหมู่ของคุณ
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.id} {...stat} />
          ))}
        </div>

        {/* Toolbar */}
        <div className="mt-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              จัดการพร้อมกัน{selected.length > 0 ? ` (${selected.length})` : ""}
            </button>
            <div className="relative" data-filter-menu>
              <button
                type="button"
                onClick={() => setFilterOpen((v) => !v)}
                aria-label="กรอง"
                className={`relative flex h-8 w-8 items-center justify-center rounded-lg border text-slate-500 hover:bg-slate-50 ${
                  activeFilterCount > 0
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-white"
                }`}
              >
                <Filter size={14} />
                {activeFilterCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-medium text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {filterOpen && (
                <div className="absolute left-0 top-full z-10 mt-1 w-64 rounded-xl border border-slate-100 bg-white p-4 shadow-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-700">ตัวกรอง</p>
                    {activeFilterCount > 0 && (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
                      >
                        ล้างตัวกรอง
                      </button>
                    )}
                  </div>

                  <div className="mt-3">
                    <p className="text-xs font-medium text-slate-400">ระดับสต็อก</p>
                    <div className="mt-1.5 flex gap-1.5">
                      {[
                        { value: "", label: "ทั้งหมด" },
                        { value: "healthy", label: "ปกติ" },
                        { value: "low", label: "ใกล้หมด" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setPage(1);
                            setFilterStockLevel(opt.value);
                          }}
                          className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                            filterStockLevel === opt.value
                              ? "bg-emerald-700 text-white"
                              : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs font-medium text-slate-400">หมวดหมู่</p>
                    <div className="mt-1.5 max-h-40 space-y-1 overflow-y-auto pr-1">
                      {categoryOptions.map((category) => (
                        <label
                          key={category}
                          className="flex items-center gap-2 rounded-lg px-1.5 py-1 text-sm text-slate-600 hover:bg-slate-50"
                        >
                          <input
                            type="checkbox"
                            checked={filterCategories.includes(category)}
                            onChange={() => toggleCategoryFilter(category)}
                            className="h-3.5 w-3.5 rounded border-slate-300 accent-emerald-600"
                          />
                          {category}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <p className="text-sm text-slate-400">
            {filteredProducts.length === 0
              ? "ไม่พบรายการ"
              : `แสดง ${startIndex + 1} - ${Math.min(
                  startIndex + pageSize,
                  filteredProducts.length
                )} จาก ${filteredProducts.length.toLocaleString()} รายการ`}
          </p>
        </div>

        {/* Table */}
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-100 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-400">
                <th className="w-10 px-6 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-slate-300 accent-emerald-600"
                  />
                </th>
                <th className="px-3 py-3 font-medium">สินค้า</th>
                <th className="px-6 py-3 font-medium">หมวดหมู่</th>
                <th className="px-6 py-3 font-medium">ราคา</th>
                <th className="px-6 py-3 font-medium">ระดับสต็อก</th>
                <th className="px-6 py-3 font-medium">ผู้จำหน่าย</th>
                <th className="px-6 py-3 text-right font-medium">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((product) => (
                <tr
                  key={product.id}
                  onClick={(e) => handleRowClick(e, product.id)}
                  className="cursor-pointer border-b border-slate-50 last:border-0 hover:bg-slate-50/70"
                >
                  <td className="px-6 py-3.5">
                    <input
                      type="checkbox"
                      checked={selected.includes(product.id)}
                      onChange={() => toggleOne(product.id)}
                      className="h-4 w-4 rounded border-slate-300 accent-emerald-600"
                    />
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium text-slate-800">{product.name}</p>
                        <p className="text-xs text-slate-400">SKU: {product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-slate-600">{product.category}</td>
                  <td className="px-6 py-3.5 font-medium text-slate-800">
                    ฿{product.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="w-32">
                      <p
                        className={`text-xs font-medium ${
                          product.stockLevel === "low" ? "text-rose-500" : "text-emerald-600"
                        }`}
                      >
                        {product.stockUnits.toLocaleString()} หน่วย {product.stockPercent}%
                      </p>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${
                            product.stockLevel === "low" ? "bg-rose-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${product.stockPercent}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                      {product.farmer}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center justify-end gap-3 text-slate-400">
                      <button
                        type="button"
                        onClick={() => goToProduct(product.id)}
                        aria-label="แก้ไข"
                        className="hover:text-slate-600"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(product.id, product.name)}
                        disabled={deleting && deleteTarget?.id === product.id}
                        aria-label="ลบสินค้า"
                        className="hover:text-rose-600 disabled:opacity-40"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-400">
                    ไม่พบสินค้าที่ตรงกับเงื่อนไขที่เลือก
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-6 py-3 text-sm">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              {getPageNumbers(safePage, totalPages).map((n, idx, arr) => (
                <span key={n} className="flex items-center gap-1">
                  {idx > 0 && n - arr[idx - 1] > 1 && (
                    <span className="px-1 text-slate-400">...</span>
                  )}
                  <button
                    type="button"
                    onClick={() => setPage(n)}
                    className={`h-8 w-8 rounded-lg text-sm ${
                      safePage === n
                        ? "bg-emerald-700 font-medium text-white"
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {n}
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="relative flex items-center gap-2 text-slate-500" data-page-size-menu>
              แสดงต่อหน้า:
              <button
                type="button"
                onClick={() => setPageSizeMenuOpen((v) => !v)}
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 font-medium text-slate-700"
              >
                {pageSize}
                <ChevronDown size={12} />
              </button>
              {pageSizeMenuOpen && (
                <div className="absolute right-0 top-full z-10 mt-1 w-20 overflow-hidden rounded-lg border border-slate-100 bg-white shadow-lg">
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setPageSize(size);
                        setPage(1);
                        setPageSizeMenuOpen(false);
                      }}
                      className={`block w-full px-3 py-1.5 text-left text-sm hover:bg-slate-50 ${
                        size === pageSize ? "font-medium text-emerald-700" : "text-slate-600"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <AlertModal
        open={!!deleteTarget}
        type="warning"
        message={`ยืนยันการลบสินค้า "${deleteTarget?.name}" ใช่หรือไม่?`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        buttonText="ลบสินค้า"
        loading={deleting}
      />

      <AlertModal
        open={!!resultAlert}
        type={resultAlert?.type}
        message={resultAlert?.message}
        onClose={() => setResultAlert(null)}
      />
    </div>
  );
}