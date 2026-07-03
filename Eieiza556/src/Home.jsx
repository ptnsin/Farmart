import { Link } from "react-router-dom";
import {
  Sprout,
  Search,
  ShoppingCart,
  Bell,
  UserCircle2,
  Truck,
  ShieldCheck,
  BadgeCheck,
  Star,
} from "lucide-react";

const featured = [
  {
    name: "เมล็ดพันธุ์ผสม",
    price: "฿85.00",
    rating: "4.8 (120)",
    emoji: "🌾",
  },
  {
    name: "ชุดปลูกกล้าไม้ระดับมืออาชีพ",
    price: "฿150.00",
    rating: "4.9 (80)",
    emoji: "🌱",
  },
  {
    name: "ปุ๋ยอินทรีย์ (5 กก.)",
    price: "฿1,250.00",
    rating: "4.7 (65)",
    emoji: "🧴",
  },
  {
    name: "ผักสดจากไร่ ชุดที่ 2",
    price: "฿65.00",
    rating: "4.9 (210)",
    emoji: "🫑",
  },
];

const perks = [
  {
    icon: Truck,
    title: "จัดส่งรวดเร็ว",
    desc: "ส่งตรงจากไร่ถึงมือคุณภายใน 24-48 ชั่วโมง",
  },
  {
    icon: ShieldCheck,
    title: "รับประกันคุณภาพ",
    desc: "ผลผลิตทุกชิ้นผ่านการรับรองมาตรฐานเกษตรอินทรีย์",
  },
  {
    icon: BadgeCheck,
    title: "ผู้ผลิตที่ผ่านการยืนยัน",
    desc: "ตรวจสอบย้อนกลับแหล่งที่มาได้ทุกคำสั่งซื้อ",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-white text-gray-900">
      {/* Top nav */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto flex items-center gap-6 px-6 py-3.5">
          <Link to="/home" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-md bg-green-800 flex items-center justify-center">
              <Sprout className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">AgriHarvest</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600 font-medium">
            <a href="#" className="hover:text-green-800">หน้าแรก</a>
            <a href="#products" className="text-green-800 font-semibold">สินค้า</a>
            <a href="#about" className="hover:text-green-800">เกี่ยวกับเรา</a>
          </nav>

          <div className="flex-1 max-w-xs ml-auto relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาสินค้า..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
            />
          </div>

          <div className="flex items-center gap-1">
            <button className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50">
              <Bell className="w-5 h-5" />
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50">
              <ShoppingCart className="w-5 h-5" />
            </button>
            <Link
              to="/dashboard"
              className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50"
            >
              <UserCircle2 className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1600&auto=format&fit=crop"
          alt="Farm field"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-green-950/90 via-green-950/60 to-green-950/20" />
        <div className="relative max-w-6xl mx-auto px-6 py-20">
          <span className="inline-block text-xs font-semibold tracking-widest text-green-300 bg-green-900/50 px-3 py-1 rounded-full mb-4">
            ผลผลิตใหม่ทุกสัปดาห์
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight max-w-lg mb-4">
            ยกระดับฟาร์มของคุณด้วยผลผลิตที่สดใหม่
          </h1>
          <p className="text-white/80 text-sm max-w-md mb-6 leading-relaxed">
            เชื่อมต่อกับเครือข่ายเกษตรกรผู้ผ่านการรับรอง เลือกซื้อเมล็ดพันธุ์
            อุปกรณ์ และผลผลิตคุณภาพสูงได้ในที่เดียว
          </p>
          <div className="flex items-center gap-3">
            <a
              href="#products"
              className="bg-green-700 hover:bg-green-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              เลือกซื้อสินค้า
            </a>
            <button className="bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-5 py-2.5 rounded-lg border border-white/30 transition-colors">
              เรียนรู้เพิ่มเติม
            </button>
          </div>
        </div>
      </section>

      {/* Highlight strip */}
      <section className="max-w-6xl mx-auto px-6 -mt-10 relative z-10 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 flex items-center gap-4">
            <span className="text-3xl">🌾</span>
            <div>
              <p className="text-sm font-semibold text-gray-900">เมล็ดพันธุ์คุณภาพ</p>
              <p className="text-xs text-gray-500 mt-0.5">คัดสรรจากแหล่งปลูกโดยตรง</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 flex items-center gap-4">
            <span className="text-3xl">🚜</span>
            <div>
              <p className="text-sm font-semibold text-gray-900">อุปกรณ์การเกษตร</p>
              <p className="text-xs text-gray-500 mt-0.5">เครื่องมือทันสมัยสำหรับทุกไร่</p>
            </div>
          </div>
          <div className="bg-gray-900 rounded-xl shadow-md p-4 flex items-center justify-between text-white">
            <div>
              <p className="text-sm font-semibold">ซื้อยกล็อต คุ้มกว่า</p>
              <p className="text-xs text-white/60 mt-0.5">ลดสูงสุด 20% เมื่อสั่งขั้นต่ำ</p>
            </div>
            <span className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-sm font-bold">
              %
            </span>
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section id="products" className="max-w-6xl mx-auto px-6 py-14">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">สินค้าขายดี</h2>
            <p className="text-sm text-gray-500 mt-1">สินค้าที่ลูกค้าเลือกซื้อมากที่สุดในเดือนนี้</p>
          </div>
          <a href="#" className="text-sm font-semibold text-green-700 hover:underline">
            ดูทั้งหมด
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featured.map((p) => (
            <div
              key={p.name}
              className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-square bg-gray-50 flex items-center justify-center text-5xl">
                {p.emoji}
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-800 leading-snug line-clamp-2 mb-1">
                  {p.name}
                </p>
                <p className="text-sm font-bold text-gray-900">{p.price}</p>
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {p.rating}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why AgriHarvest */}
      <section id="about" className="bg-green-950 text-white">
        <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-2xl font-bold mb-6">ทำไมต้องเลือก AgriHarvest?</h2>
            <div className="space-y-5">
              {perks.map((perk) => {
                const Icon = perk.icon;
                return (
                  <div key={perk.title} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-green-300" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{perk.title}</p>
                      <p className="text-white/60 text-sm mt-0.5">{perk.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="rounded-xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?q=80&w=900&auto=format&fit=crop"
              alt="Farmer holding soil"
              className="w-full h-72 object-cover"
            />
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-green-50">
        <div className="max-w-2xl mx-auto px-6 py-14 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            ร่วมเป็นส่วนหนึ่งของชุมชน AgriHarvest
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            รับข่าวสารผลผลิตใหม่และโปรโมชั่นพิเศษก่อนใครทางอีเมล
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex items-center gap-2 max-w-sm mx-auto"
          >
            <input
              type="email"
              placeholder="อีเมลของคุณ"
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-700"
            />
            <button
              type="submit"
              className="bg-green-900 hover:bg-green-800 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              สมัคร
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between gap-8">
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md bg-green-800 flex items-center justify-center">
                <Sprout className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-sm">AgriHarvest</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              แพลตฟอร์มเชื่อมต่อเกษตรกรและผู้บริโภคเพื่อผลผลิตที่ยั่งยืน
            </p>
            <div className="flex items-center gap-3 mt-4 text-gray-400">
              <a href="#" aria-label="Facebook" className="hover:text-green-700">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.66 9.13 8.44 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99C18.34 21.13 22 16.99 22 12z" />
                </svg>
              </a>
              <a href="#" aria-label="Instagram" className="hover:text-green-700">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2c2.72 0 3.06.01 4.12.06 1.06.05 1.79.22 2.43.47.66.26 1.22.6 1.77 1.15.55.55.89 1.11 1.15 1.77.25.64.42 1.37.47 2.43.05 1.06.06 1.4.06 4.12s-.01 3.06-.06 4.12c-.05 1.06-.22 1.79-.47 2.43a4.9 4.9 0 0 1-1.15 1.77c-.55.55-1.11.89-1.77 1.15-.64.25-1.37.42-2.43.47-1.06.05-1.4.06-4.12.06s-3.06-.01-4.12-.06c-1.06-.05-1.79-.22-2.43-.47a4.9 4.9 0 0 1-1.77-1.15 4.9 4.9 0 0 1-1.15-1.77c-.25-.64-.42-1.37-.47-2.43C2.01 15.06 2 14.72 2 12s.01-3.06.06-4.12c.05-1.06.22-1.79.47-2.43.26-.66.6-1.22 1.15-1.77A4.9 4.9 0 0 1 5.45.53C6.09.28 6.82.11 7.88.06 8.94.01 9.28 0 12 0zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4zm5.2-8.4a1.17 1.17 0 1 0 0-2.34 1.17 1.17 0 0 0 0 2.34z" />
                </svg>
              </a>
              <a href="#" aria-label="Twitter / X" className="hover:text-green-700">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.9 2H22l-7.6 8.7L23 22h-6.9l-5.4-6.7L4.4 22H1.3l8.1-9.3L1 2h7.1l4.9 6.1L18.9 2zm-1.2 18h1.9L7.4 4H5.4l12.3 16z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
            <div>
              <p className="font-semibold text-gray-900 mb-2.5">Shipping</p>
              <ul className="space-y-2 text-gray-500 text-xs">
                <li><a href="#" className="hover:text-green-700">ติดตามพัสดุ</a></li>
                <li><a href="#" className="hover:text-green-700">นโยบายการจัดส่ง</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-2.5">Help</p>
              <ul className="space-y-2 text-gray-500 text-xs">
                <li><a href="#" className="hover:text-green-700">ศูนย์ช่วยเหลือ</a></li>
                <li><a href="#" className="hover:text-green-700">ติดต่อเรา</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-2.5">Legal</p>
              <ul className="space-y-2 text-gray-500 text-xs">
                <li><a href="#" className="hover:text-green-700">ข้อกำหนดการใช้งาน</a></li>
                <li><a href="#" className="hover:text-green-700">นโยบายความเป็นส่วนตัว</a></li>
              </ul>
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 pb-6">
          © 2024 AgriHarvest. Sustainable farming, delivered.
        </p>
      </footer>
    </div>
  );
}
