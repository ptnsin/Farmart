import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Sprout, User, Lock, Tractor, ArrowRight } from "lucide-react";

export default function AgriHarvestLogin() {
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

    // Save session info to localStorage
    const session = {
      email: email.trim(),
      keepSignedIn,
      loggedInAt: new Date().toISOString(),
    };
    localStorage.setItem("agriharvest_user", JSON.stringify(session));
    localStorage.setItem("agriharvest_auth", "true");

    // Redirect to dashboard
    navigate("/dashboard");
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
            <span className="text-lg font-bold text-gray-900">AgriHarvest</span>
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

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 tracking-wide">OR CONTINUE WITH</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Social buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.66 9.13 8.44 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99C18.34 21.13 22 16.99 22 12z" />
              </svg>
              Facebook
            </button>
          </div>

          <p className="text-sm text-gray-600 text-center mt-6">
            New to AgriHarvest?{" "}
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
