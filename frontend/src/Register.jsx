import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sprout, User, Mail, Phone, Lock, Tractor } from "lucide-react";
import { registerUser, saveSession } from "./data/userStore";

export default function AgriHarvestRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.fullName.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }
    if (!agree) {
      setError("กรุณายอมรับข้อกำหนดการใช้งานก่อนสร้างบัญชี");
      return;
    }
    setError("");

    try {
      const user = registerUser({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      saveSession(user, false);
      navigate("/home"); // ผู้สมัครใหม่ทุกคนเป็น role CUSTOMER
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-gray-50">
      {/* Left panel - image / hero */}
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
          <h1 className="text-4xl font-bold leading-tight mb-4">AgriHarvest</h1>
          <p className="text-white/85 text-sm leading-relaxed max-w-sm mb-6">
            ร่วมเป็นส่วนหนึ่งของเครือข่ายเกษตรกรรมยุคใหม่ เชื่อมต่อผลผลิตของคุณ
            กับผู้ซื้อทั่วประเทศได้ในไม่กี่คลิก
          </p>
          <div className="flex items-center gap-3">
            <span className="w-8 h-[2px] bg-green-400" />
            <span className="text-xs font-semibold tracking-widest">
              SUSTAINABLE GROWTH
            </span>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-green-800 flex items-center justify-center">
              <Sprout className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <span className="text-lg font-bold text-gray-900">AgriHarvest</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">สร้างบัญชีผู้ใช้งาน</h2>
          <p className="text-sm text-gray-500 mb-8">
            กรอกข้อมูลเพื่อเริ่มต้นการเดินทางไปกับเรา
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                ชื่อ-นามสกุล
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={form.fullName}
                  onChange={update("fullName")}
                  placeholder="ภาษาไทยหรืออังกฤษ"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                อีเมล
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={update("email")}
                  placeholder="example@mail.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                เบอร์โทรศัพท์
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={update("phone")}
                  placeholder="08x-xxx-xxxx"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                  รหัสผ่าน
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    value={form.password}
                    onChange={update("password")}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                  ยืนยันรหัสผ่าน
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={update("confirmPassword")}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <label className="flex items-start gap-2 text-sm text-gray-600 pt-1">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-gray-300 text-green-700 focus:ring-green-700"
              />
              <span>
                ฉันยอมรับ{" "}
                <a href="#" className="text-green-700 font-medium hover:underline">
                  ข้อกำหนดการใช้งาน
                </a>{" "}
                และ{" "}
                <a href="#" className="text-green-700 font-medium hover:underline">
                  นโยบายความเป็นส่วนตัว
                </a>
              </span>
            </label>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              className="w-full bg-green-900 hover:bg-green-800 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              สร้างบัญชี
            </button>
          </form>

          <p className="text-sm text-gray-600 text-center mt-6">
            มีบัญชีอยู่แล้ว?{" "}
            <Link to="/" className="text-green-700 font-semibold hover:underline">
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}