import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Sprout, User, Lock, Tractor, ArrowRight } from "lucide-react";
import { authenticate, saveSession } from "./data/userStore";

export default function FarmartLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("กรุณากรอกอีเมล/ชื่อผู้ใช้ และรหัสผ่าน");
      return;
    }
    setError("");

    try {
      const user = authenticate(email, password);
      if (!user) {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        return;
      }
      saveSession(user, keepSignedIn);

      const roleRoutes = {
        CUSTOMER: "/home",
        EMPLOYEE: "/employee/orders",
        ADMIN: "/admin/users",
      };
      navigate(roleRoutes[user.role] || "/home");
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

        {/* Top badge */}
        <div className="relative z-10 p-8">
          <div className="inline-flex items-center gap-2 bg-white rounded-lg px-4 py-2 shadow">
            <Tractor className="w-5 h-5 text-green-700" />
            <div className="text-left leading-tight">
              <div className="text-[10px] text-gray-500">Verified Producer</div>
              <div className="text-xs font-bold text-gray-900">Global Standards</div>
            </div>
          </div>
        </div>

        {/* Bottom text */}
        <div className="relative z-10 mt-auto p-8 text-white">
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Cultivating the
            <br />
            future of farming.
          </h1>
          <p className="text-white/85 text-sm leading-relaxed max-w-sm mb-6">
            Join our community of growers and distributors. Access
            professional tools designed for modern agriculture.
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

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
          <p className="text-sm text-gray-500 mb-8">
            Sign in to manage your harvest and orders.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                Email or Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@farm.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-gray-800">
                  Password
                </label>
                <a href="#" className="text-xs font-medium text-green-700 hover:underline">
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
                />
              </div>
            </div>

            {/* Keep me signed in */}
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={keepSignedIn}
                onChange={(e) => setKeepSignedIn(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-green-700 focus:ring-green-700"
              />
              Keep me signed in for 30 days
            </label>

            {error && (
              <p className="text-sm text-red-600 -mt-2">{error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-green-900 hover:bg-green-800 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Sign In to Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-sm text-gray-600 text-center mt-6">
            New to Farmart?{" "}
            <Link to="/register" className="text-green-700 font-semibold hover:underline">
              Create an account
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