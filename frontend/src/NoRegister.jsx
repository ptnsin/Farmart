import { Link } from "react-router-dom";
import {
  Sprout,
  Truck,
  ShieldCheck,
  BadgeCheck,
  Star,
  LogIn,
  UserPlus,
} from "lucide-react";
import Footer from "./Footer";

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

const previewProducts = [
  {
    id: "preview-1",
    name: "ผักสลัดออร์แกนิกรวม",
    price: 89,
    image:
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "preview-2",
    name: "มะเขือเทศเชอร์รี่ปลอดสาร",
    price: 65,
    image:
      "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "preview-3",
    name: "เมล็ดพันธุ์ผักสวนครัวชุดเริ่มต้น",
    price: 129,
    image:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "preview-4",
    name: "ผลไม้รวมตามฤดูกาล",
    price: 149,
    image:
      "https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=600&auto=format&fit=crop",
  },
];

export default function NoRegister() {
  return (
    <div className="min-h-screen w-full bg-white text-gray-900">
      {/* Top nav — public version, no cart/notification/profile */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto flex items-center gap-6 px-6 py-3.5">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-md bg-green-800 flex items-center justify-center">
              <Sprout className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">Farmart</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600 font-medium ml-4">
            <a href="#products" className="hover:text-green-800">สินค้า</a>
            <Link to="/help-center" className="hover:text-green-800">ศูนย์ช่วยเหลือ</Link>
            <Link to="/help-center#contact" className="hover:text-green-800">ติดต่อเรา</Link>
          </nav>

          <div className="flex items-center gap-2 ml-auto">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-green-800 px-3 py-2 rounded-lg hover:bg-gray-50"
            >
              <LogIn className="w-4 h-4" />
              เข้าสู่ระบบ
            </Link>
            <Link
              to="/register"
              className="flex items-center gap-1.5 bg-green-800 hover:bg-green-900 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              สมัครสมาชิก
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
            อุปกรณ์ และผลผลิตคุณภาพสูงได้ในที่เดียว สมัครสมาชิกวันนี้เพื่อเริ่มสั่งซื้อ
          </p>
          <div className="flex items-center gap-3">
            <Link
              to="/register"
              className="bg-green-700 hover:bg-green-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              สมัครสมาชิกฟรี
            </Link>
            <Link
              to="/"
              className="bg-white/10 hover:bg-white/20 border border-white/30 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              เข้าสู่ระบบ
            </Link>
          </div>
        </div>
      </section>

      {/* Highlight strip */}
      <section className="max-w-6xl mx-auto px-6 -mt-10 relative z-10 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 flex items-center gap-4">
            <img
              src="https://images.unsplash.com/photo-1635372638513-8a960010a0ff?q=80&w=200&auto=format&fit=crop"
              alt="เมล็ดพันธุ์คุณภาพ"
              className="w-12 h-12 rounded-lg object-cover shrink-0"
            />
            <div>
              <p className="text-sm font-semibold text-gray-900">เมล็ดพันธุ์คุณภาพ</p>
              <p className="text-xs text-gray-500 mt-0.5">คัดสรรจากแหล่งปลูกโดยตรง</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 flex items-center gap-4">
            <img
              src="https://images.unsplash.com/photo-1635168708643-aa398019ca5b?q=80&w=200&auto=format&fit=crop"
              alt="อุปกรณ์การเกษตร"
              className="w-12 h-12 rounded-lg object-cover shrink-0"
            />
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

      {/* Preview products */}
      <section id="products" className="max-w-6xl mx-auto px-6 py-14">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">สินค้าขายดี</h2>
            <p className="text-sm text-gray-500 mt-1">
              ตัวอย่างผลผลิตจากเกษตรกรของเรา สมัครสมาชิกเพื่อดูสินค้าทั้งหมดและสั่งซื้อ
            </p>
          </div>
          <Link to="/register" className="text-sm font-semibold text-green-700 hover:underline">
            ดูทั้งหมด
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {previewProducts.map((p) => (
            <Link
              to="/register"
              key={p.id}
              className="group border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow block relative"
            >
              <div className="relative aspect-square bg-gray-50">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="text-white text-xs font-semibold bg-green-800 px-3 py-1.5 rounded-full">
                    สมัครเพื่อสั่งซื้อ
                  </span>
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-800 leading-snug line-clamp-2 mb-1">
                  {p.name}
                </p>
                <p className="text-sm font-bold text-gray-900">฿{p.price.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  4.8
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Why Farmart */}
      <section id="about" className="bg-green-950 text-white">
        <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-2xl font-bold mb-6">ทำไมต้องเลือก Farmart?</h2>
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

      {/* Register CTA */}
      <section className="bg-green-50">
        <div className="max-w-2xl mx-auto px-6 py-14 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            ร่วมเป็นส่วนหนึ่งของชุมชน Farmart
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            สมัครสมาชิกวันนี้เพื่อเริ่มสั่งซื้อผลผลิตสดใหม่
            และรับข่าวสารโปรโมชั่นพิเศษก่อนใคร
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/register"
              className="inline-block bg-green-900 hover:bg-green-800 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
            >
              สมัครสมาชิก
            </Link>
            <Link
              to="/"
              className="inline-block border border-green-900 text-green-900 hover:bg-green-100 text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
            >
              เข้าสู่ระบบ
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}