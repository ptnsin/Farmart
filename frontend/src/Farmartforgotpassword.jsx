import { useState } from "react";
import { Link } from "react-router-dom";
import { Sprout, Mail, Tractor, ArrowRight, CheckCircle2 } from "lucide-react";
import { requestPasswordReset } from "./data/authStore";

export default function FarmartForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("กรุณากรอกอีเมลที่ใช้สมัครสมาชิก");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      await requestPasswordReset(email.trim());
      setSent(true);
    } catch (err) {
      setError(err.message || "ไม่สามารถส่งคำขอได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-gray-50">
      {/* Left panel - image / hero (เหมือนหน้า Login) */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=1200&auto=format&fit=crop"
          alt="Farm field at sunrise"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-green-950/90 via-green-950/20 to-black/20" />

        <div className="relative z-10 p-8">
          <div className="inline-flex items-center gap-2 bg-white rounded-lg px-4 py-2 shadow">
            <Tractor className="w-5 h-5 text-green-700" />
            <div className="text-left leading-tight">
              <div className="text-[10px] text-gray-500">Verified Producer</div>
              <div className="text-xs font-bold text-gray-900">Global Standards</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-auto p-8 text-white">
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Every season
            <br />
            starts with a reset.
          </h1>
          <p className="text-white/85 text-sm leading-relaxed max-w-sm mb-6">
            เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปยังอีเมลของคุณ
            เพื่อให้กลับเข้าดูแลผลผลิตของคุณได้อีกครั้ง
          </p>
          <div className="flex items-center gap-3">
            <span className="w-8 h-[2px] bg-green-400" />
            <span className="text-xs font-semibold tracking-widest">
              HARVEST WISDOM
            </span>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-green-800 flex items-center justify-center">
              <Sprout className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <span className="text-lg font-bold text-gray-900">Farmart</span>
          </div>

          {!sent ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">ลืมรหัสผ่าน?</h2>
              <p className="text-sm text-gray-500 mb-8">
                กรอกอีเมลที่ใช้สมัครสมาชิก เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ให้คุณ
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                    อีเมล
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@farm.com"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
                    />
                  </div>
                </div>

                {error && <p className="text-sm text-red-600 -mt-2">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 bg-green-900 hover:bg-green-800 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60"
                >
                  {submitting ? "กำลังส่งลิงก์..." : "ส่งลิงก์รีเซ็ตรหัสผ่าน"}
                  {!submitting && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-green-700" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">ส่งลิงก์แล้ว</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                หากอีเมล <span className="font-semibold text-gray-700">{email}</span> มีอยู่ในระบบ
                เราได้ส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปให้แล้ว กรุณาตรวจสอบกล่องขาเข้า
                (และโฟลเดอร์สแปม) ของคุณ
              </p>
            </div>
          )}

          <p className="text-sm text-gray-600 text-center mt-6">
            นึกรหัสผ่านได้แล้ว?{" "}
            <Link to="/" className="text-green-700 font-semibold hover:underline">
              กลับไปหน้าเข้าสู่ระบบ
            </Link>
          </p>

          <div className="flex items-center justify-center gap-4 text-xs text-gray-400 mt-8 pt-6 border-t border-gray-100">
            <a href="#" className="hover:text-gray-600">Privacy Policy</a>
            <a href="#" className="hover:text-gray-600">Terms of Service</a>
            <a href="#" className="hover:text-gray-600">Contact Support</a>
          </div>
        </div>
      </div>
    </div>
  );
}