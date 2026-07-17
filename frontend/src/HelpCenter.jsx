import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Sprout,
  Search,
  ShoppingCart,
  UserCircle2,
  Truck,
  ShieldCheck,
  BadgeCheck,
  ChevronDown,
  Package,
  CreditCard,
  RotateCcw,
  UserCog,
  Leaf,
  Phone,
  Mail,
  Clock,
} from "lucide-react";
import { useCart } from "./CartContext";
import { fetchCurrentUser, getCachedUser } from "./data/authStore";
import NotificationBell from "./NotificationBell";
import Footer from "./Footer";

const categories = [
  {
    icon: Package,
    title: "การสั่งซื้อ",
    desc: "แก้ไข ยกเลิก หรือตรวจสอบสถานะคำสั่งซื้อ",
  },
  {
    icon: Truck,
    title: "การจัดส่ง",
    desc: "ระยะเวลา ค่าส่ง และพื้นที่ให้บริการ",
  },
  {
    icon: CreditCard,
    title: "การชำระเงิน",
    desc: "ช่องทางชำระเงินและใบเสร็จรับเงิน",
  },
  {
    icon: RotateCcw,
    title: "การคืนสินค้า",
    desc: "ขั้นตอนคืนเงินและเปลี่ยนสินค้า",
  },
  {
    icon: UserCog,
    title: "บัญชีผู้ใช้",
    desc: "ตั้งค่าโปรไฟล์ ความปลอดภัย และการแจ้งเตือน",
  },
  {
    icon: Leaf,
    title: "คุณภาพผลผลิต",
    desc: "มาตรฐานสินค้าและการรับรองแหล่งที่มา",
  },
];

const faqs = [
  {
    q: "ฉันสามารถติดตามสถานะคำสั่งซื้อได้อย่างไร",
    a: "เข้าสู่หน้า \"ติดตามพัสดุ\" แล้วกรอกหมายเลขคำสั่งซื้อของคุณ ระบบจะแสดงสถานะล่าสุดแบบเรียลไทม์ ตั้งแต่การเตรียมสินค้าจนถึงการจัดส่งถึงมือคุณ",
  },
  {
    q: "ผลผลิตสดจะจัดส่งถึงภายในกี่วัน",
    a: "โดยทั่วไปสินค้าสดจะถูกจัดส่งภายใน 24-48 ชั่วโมงหลังเก็บเกี่ยว เพื่อรักษาความสดใหม่ให้ได้มากที่สุด ระยะเวลาอาจแตกต่างกันไปตามพื้นที่ปลายทาง",
  },
  {
    q: "หากได้รับสินค้าที่ไม่ได้คุณภาพ ต้องทำอย่างไร",
    a: "ถ่ายภาพสินค้าที่มีปัญหาแล้วแจ้งผ่านหน้า \"คำสั่งซื้อ\" ภายใน 24 ชั่วโมงหลังได้รับสินค้า ทีมงานจะดำเนินการคืนเงินหรือจัดส่งสินค้าใหม่ให้โดยไม่มีค่าใช้จ่ายเพิ่มเติม",
  },
  {
    q: "มีช่องทางการชำระเงินอะไรบ้าง",
    a: "รองรับบัตรเครดิต/เดบิต โอนผ่านธนาคาร พร้อมเพย์ และการชำระเงินปลายทางสำหรับพื้นที่ที่ร่วมรายการ",
  },
  {
    q: "สินค้าทุกชิ้นผ่านการรับรองมาตรฐานหรือไม่",
    a: "สินค้าทุกชิ้นบนแพลตฟอร์มผ่านการตรวจสอบย้อนกลับแหล่งที่มา และเกษตรกรผู้ผลิตทุกรายได้รับการยืนยันตัวตนตามมาตรฐานเกษตรอินทรีย์ของเรา",
  },
  {
    q: "ต้องการยกเลิกคำสั่งซื้อ สามารถทำได้เมื่อไหร่",
    a: "สามารถยกเลิกได้ฟรีก่อนที่สถานะจะเปลี่ยนเป็น \"กำลังจัดเตรียมสินค้า\" หลังจากนั้นกรุณาติดต่อทีมสนับสนุนเพื่อขอความช่วยเหลือเพิ่มเติม",
  },
];

function FaqItem({ item, isOpen, onToggle }) {
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden bg-white">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-semibold text-gray-900">{item.q}</span>
        <ChevronDown
          className={`w-4 h-4 text-green-700 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-200 ease-in-out ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
        style={{ display: "grid" }}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-4 text-sm text-gray-500 leading-relaxed">{item.a}</p>
        </div>
      </div>
    </div>
  );
}

export default function HelpCenter() {
  const { itemCount } = useCart();
  const [openIndex, setOpenIndex] = useState(0);
  const [query, setQuery] = useState("");

  // รูปโปรไฟล์ผู้ใช้ปัจจุบัน (แสดงที่ไอคอนมุมขวาบน)
  const [avatar, setAvatar] = useState(null);
  useEffect(() => {
    const cached = getCachedUser();
    if (cached?.avatar) setAvatar(cached.avatar);
    fetchCurrentUser()
      .then((user) => {
        if (user?.avatar) setAvatar(user.avatar);
      })
      .catch(() => {});
  }, []);

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(query.toLowerCase()) ||
      f.a.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full bg-white text-gray-900">
      {/* Top nav (shared with Home) */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto flex items-center gap-6 px-6 py-3.5">
          <Link to="/home" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-md bg-green-800 flex items-center justify-center">
              <Sprout className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">Farmart</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600 font-medium">
            <Link to="/home" className="hover:text-green-800">หน้าแรก</Link>
            <Link to="/products" className="hover:text-green-800">สินค้า</Link>
            <Link to="/tracking" className="hover:text-green-800">ติดตามพัสดุ</Link>
            <Link to="/orders" className="hover:text-green-800">คำสั่งซื้อ</Link>
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
            <NotificationBell />
            <Link
              to="/cart"
              title="รถเข็นของคุณ"
              className="relative w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-green-700 text-white text-[10px] font-bold flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            <Link
              to="/profile"
              title="โปรไฟล์"
              className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50 overflow-hidden"
            >
              {avatar ? (
                <img src={avatar} alt="โปรไฟล์" className="w-full h-full object-cover" />
              ) : (
                <UserCircle2 className="w-6 h-6" />
              )}
            </Link>
          </div>
        </div>
      </header>


      {/* Help hero */}
      <section className="relative overflow-hidden bg-green-950">
        <img
          src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=1600&auto=format&fit=crop"
          alt="Farmer and support"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-green-950/40 via-green-950/80 to-green-950" />
        <div className="relative max-w-6xl mx-auto px-6 py-16 text-center">
          <span className="inline-block text-xs font-semibold tracking-widest text-green-300 bg-green-900/50 px-3 py-1 rounded-full mb-4">
            ศูนย์ช่วยเหลือ
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
            มีคำถาม? เราพร้อมช่วยเหลือคุณ
          </h1>
          <p className="text-white/70 text-sm max-w-lg mx-auto mb-7 leading-relaxed">
            ค้นหาคำตอบเกี่ยวกับคำสั่งซื้อ การจัดส่ง และบริการต่าง ๆ
            หรือติดต่อทีมงานของเราได้โดยตรง
          </p>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="พิมพ์คำถามของคุณ เช่น การคืนเงิน"
              className="w-full pl-11 pr-4 py-3 rounded-xl text-sm text-gray-900 bg-white border border-transparent focus:outline-none focus:ring-2 focus:ring-green-500 shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900">หมวดหมู่ความช่วยเหลือ</h2>
          <p className="text-sm text-gray-500 mt-1">เลือกหัวข้อที่ตรงกับสิ่งที่คุณต้องการทราบ</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.title}
                className="text-left border border-gray-100 rounded-xl p-4 hover:shadow-md hover:border-green-100 transition-all bg-white"
              >
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-green-700" />
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1">{c.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{c.desc}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-green-50/60">
        <div className="max-w-3xl mx-auto px-6 py-14">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">คำถามที่พบบ่อย</h2>
            <p className="text-sm text-gray-500 mt-1">
              {query ? `ผลการค้นหาสำหรับ "${query}"` : "รวมคำตอบที่ลูกค้าถามมากที่สุด"}
            </p>
          </div>

          <div className="space-y-3">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((item, idx) => (
                <FaqItem
                  key={item.q}
                  item={item}
                  isOpen={openIndex === idx}
                  onToggle={() => setOpenIndex(openIndex === idx ? -1 : idx)}
                />
              ))
            ) : (
              <div className="text-center py-10 border border-dashed border-gray-200 rounded-xl bg-white">
                <p className="text-sm text-gray-500">
                  ไม่พบคำตอบที่ตรงกับ "{query}" ลองติดต่อทีมสนับสนุนของเราด้านล่าง
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact support */}
{/* Contact support */}
      <section id="contact" className="max-w-6xl mx-auto px-6 py-14 scroll-mt-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="border border-gray-100 rounded-xl p-5 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-800 flex items-center justify-center">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">โทรหาเรา</p>
              <p className="text-xs text-gray-500 mt-1">02-123-4567 (จันทร์-เสาร์ 08:00-18:00 น.)</p>
            </div>
            <a href="tel:0212345678" className="mt-auto text-xs font-semibold text-green-700 hover:underline">
              โทรเลย
            </a>
          </div>
          <div className="border border-gray-100 rounded-xl p-5 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-800 flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">อีเมลสนับสนุน</p>
              <p className="text-xs text-gray-500 mt-1">[email protected] ตอบกลับภายใน 24 ชม.</p>
            </div>
            <a href="mailto:[email protected]" className="mt-auto text-xs font-semibold text-green-700 hover:underline">
              ส่งอีเมล
            </a>
          </div>
        </div>

        <div className="rounded-xl bg-green-950 text-white p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-green-300" />
            </div>
            <div>
              <p className="text-sm font-semibold">ยังไม่พบคำตอบที่ต้องการใช่ไหม?</p>
              <p className="text-white/60 text-xs mt-0.5">ทีมงานของเราพร้อมช่วยเหลือคุณตลอดสัปดาห์</p>
            </div>
          </div>
          <Link
            to="/orders"
            className="bg-green-700 hover:bg-green-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors shrink-0"
          >
            ดูคำสั่งซื้อของฉัน
          </Link>
        </div>
      </section>

      {/* Trust strip (reuses Home's perk icons for consistency) */}
      <section className="border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <Truck className="w-5 h-5 text-green-700 shrink-0" />
            <p className="text-xs text-gray-500">จัดส่งรวดเร็วภายใน 24-48 ชั่วโมง</p>
          </div>
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <ShieldCheck className="w-5 h-5 text-green-700 shrink-0" />
            <p className="text-xs text-gray-500">รับประกันคุณภาพทุกคำสั่งซื้อ</p>
          </div>
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <BadgeCheck className="w-5 h-5 text-green-700 shrink-0" />
            <p className="text-xs text-gray-500">ผู้ผลิตผ่านการยืนยันตัวตน</p>
          </div>
        </div>
      </section>
<Footer />
    </div>
  );
}