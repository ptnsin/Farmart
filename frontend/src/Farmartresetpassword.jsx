import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Sprout, Lock, CheckCircle2 } from "lucide-react";
import { resetPassword } from "./data/authStore";

export default function FarmartResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError("ลิงก์ไม่ถูกต้อง กรุณาขอลิงก์รีเซ็ตรหัสผ่านใหม่");
      return;
    }
    if (password.length < 6) {
      setError("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      return;
    }
    if (password !== confirmPassword) {
      setError("รหัสผ่านยืนยันไม่ตรงกัน");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await resetPassword(token, password, confirmPassword);
      setDone(true);
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 rounded-lg bg-green-800 flex items-center justify-center">
            <Sprout className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <span className="text-lg font-bold text-gray-900">Farmart</span>
        </div>

        {!done ? (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-1 text-center">
              ตั้งรหัสผ่านใหม่
            </h2>
            <p className="text-sm text-gray-500 mb-8 text-center">
              กรอกรหัสผ่านใหม่ของคุณ
            </p>

            {!token && (
              <p className="text-sm text-red-600 mb-4 text-center">
                ลิงก์นี้ไม่ถูกต้อง กรุณาขอลิงก์ใหม่จากหน้า "ลืมรหัสผ่าน"
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                  รหัสผ่านใหม่
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="อย่างน้อย 6 ตัวอักษร"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                  ยืนยันรหัสผ่านใหม่
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="กรอกรหัสผ่านอีกครั้ง"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
                  />
                </div>
              </div>

              {error && <p className="text-sm text-red-600 -mt-2">{error}</p>}

              <button
                type="submit"
                disabled={submitting || !token}
                className="w-full bg-green-900 hover:bg-green-800 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60"
              >
                {submitting ? "กำลังบันทึก..." : "ตั้งรหัสผ่านใหม่"}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7 text-green-700" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">สำเร็จ!</h2>
            <p className="text-sm text-gray-500">
              ตั้งรหัสผ่านใหม่เรียบร้อยแล้ว กำลังพาไปหน้าเข้าสู่ระบบ...
            </p>
          </div>
        )}

        <p className="text-sm text-gray-600 text-center mt-6">
          <Link to="/" className="text-green-700 font-semibold hover:underline">
            กลับไปหน้าเข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </div>
  );
}