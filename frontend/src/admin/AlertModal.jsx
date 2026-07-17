import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

const VARIANTS = {
  success: {
    icon: CheckCircle2,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    buttonColor: "text-emerald-700 hover:text-emerald-800",
  },
  error: {
    icon: XCircle,
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
    buttonColor: "text-rose-700 hover:text-rose-800",
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    buttonColor: "text-amber-700 hover:text-amber-800",
  },
  info: {
    icon: Info,
    iconBg: "bg-sky-50",
    iconColor: "text-sky-600",
    buttonColor: "text-sky-700 hover:text-sky-800",
  },
};

/**
 * Alert modal อเนกประสงค์ — ใช้ได้ทุกหน้าในโปรเจกต์ แค่ import แล้วคุม state เอง
 *
 * ตัวอย่าง:
 *   const [alert, setAlert] = useState(null); // null | { type, message }
 *   ...
 *   setAlert({ type: "success", message: "เพิ่มที่อยู่ใหม่เรียบร้อยแล้ว" });
 *   setAlert({ type: "error", message: "ลบสินค้าไม่สำเร็จ กรุณาลองใหม่" });
 *   ...
 *   <AlertModal
 *     open={!!alert}
 *     type={alert?.type}
 *     message={alert?.message}
 *     onClose={() => setAlert(null)}
 *   />
 */
export default function AlertModal({
  open,
  type = "success",
  message,
  onClose,
  onConfirm,
  buttonText = "ตกลง",
  cancelText = "ยกเลิก",
  loading = false,
}) {
  if (!open) return null;

  const variant = VARIANTS[type] || VARIANTS.success;
  const Icon = variant.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onConfirm ? undefined : onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl bg-white px-8 py-10 text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="ปิด"
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
        >
          <X size={18} />
        </button>

        <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${variant.iconBg}`}>
          <Icon size={30} className={variant.iconColor} />
        </div>

        <p className="text-base font-medium text-slate-800">{message}</p>

        {onConfirm ? (
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${
                type === "error" || type === "warning"
                  ? "bg-rose-600 hover:bg-rose-700"
                  : "bg-emerald-700 hover:bg-emerald-800"
              }`}
            >
              {loading ? "กำลังดำเนินการ..." : buttonText}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className={`mt-6 text-sm font-semibold ${variant.buttonColor}`}
          >
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
}