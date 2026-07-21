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
  Phone,
  Mail,
  Send,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useCart } from "./CartContext";
import { fetchCurrentUser, getCachedUser, isAuthenticated } from "./data/authStore";
import { submitSupportTicket } from "./data/reportsStore";
import { getMyOrders, toStatusBadge } from "./data/orderStore";
import NotificationBell from "./NotificationBell";
import Footer from "./Footer";

function ContactCard({ icon: Icon, title, detail, href, cta }) {
  return (
    <div className="border border-gray-100 rounded-xl p-5 flex flex-col gap-3">
      <div className="w-10 h-10 rounded-lg bg-green-800 flex items-center justify-center">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-xs text-gray-500 mt-1">{detail}</p>
      </div>
      <a href={href} className="mt-auto text-xs font-semibold text-green-700 hover:underline">
        {cta}
      </a>
    </div>
  );
}

export default function HelpCenter() {
  const { itemCount } = useCart();

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

  const loggedIn = isAuthenticated();

  // ฟอร์มแจ้งปัญหา/ติดต่อทีมงาน
  const [form, setForm] = useState({ subject: "", message: "", relatedRef: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // รายการคำสั่งซื้อของผู้ใช้คนนี้ ใช้เติมตัวเลือกในช่อง "เลขคำสั่งซื้อที่เกี่ยวข้อง"
  // กันลูกค้าพิมพ์เลขออเดอร์ผิด/จำไม่ได้ ให้เลือกจากลิสต์ของตัวเองแทน
  const [myOrders, setMyOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (!loggedIn) return;
    setOrdersLoading(true);
    getMyOrders()
      .then((orders) => setMyOrders(orders || []))
      .catch(() => setMyOrders([]))
      .finally(() => setOrdersLoading(false));
  }, [loggedIn]);

  async function handleSubmitTicket(e) {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) {
      setSubmitError("กรุณากรอกหัวข้อและรายละเอียดปัญหา");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitSupportTicket({
        subject: form.subject.trim(),
        message: form.message.trim(),
        relatedRef: form.relatedRef.trim(),
      });
      setSubmitted(true);
      setForm({ subject: "", message: "", relatedRef: "" });
    } catch (err) {
      setSubmitError(err.message || "ส่งข้อความไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  }

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
          <p className="text-white/70 text-sm max-w-lg mx-auto leading-relaxed">
            แจ้งปัญหาหรือส่งข้อความถึงทีมงานของเราด้านล่าง เราจะติดต่อกลับโดยเร็วที่สุด
          </p>
        </div>
      </section>

      {/* Contact support */}
      <section id="contact" className="max-w-6xl mx-auto px-6 py-14 scroll-mt-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <ContactCard
            icon={Phone}
            title="โทรหาเรา"
            detail="02-123-4567 (จันทร์-เสาร์ 08:00-18:00 น.)"
            href="tel:0212345678"
            cta="โทรเลย"
          />
          <ContactCard
            icon={Mail}
            title="อีเมลสนับสนุน"
            detail="[email protected] ตอบกลับภายใน 24 ชม."
            href="mailto:[email protected]"
            cta="ส่งอีเมล"
          />
        </div>

        {/* Report an issue form — เชื่อมกับ POST /api/support จริง */}
        <div id="contact-form" className="mt-8 border border-gray-100 rounded-xl p-6 bg-white scroll-mt-24">
          <h2 className="text-lg font-bold text-gray-900 mb-1">แจ้งปัญหา / ส่งข้อความถึงทีมงาน</h2>
          <p className="text-sm text-gray-500 mb-5">
            ทีมงานจะเห็นข้อความของคุณทันทีในระบบหลังบ้าน และจะติดต่อกลับโดยเร็วที่สุด
          </p>

          {!loggedIn ? (
            <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl bg-gray-50">
              <p className="text-sm text-gray-600 mb-3">กรุณาเข้าสู่ระบบก่อนส่งข้อความถึงทีมงาน</p>
              <Link
                to="/"
                className="inline-block bg-green-800 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
              >
                เข้าสู่ระบบ
              </Link>
            </div>
          ) : submitted ? (
            <div className="text-center py-8 border border-dashed border-green-200 rounded-xl bg-green-50">
              <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-900">ส่งข้อความเรียบร้อยแล้ว</p>
              <p className="text-xs text-gray-500 mt-1">ทีมงานจะติดต่อกลับโดยเร็วที่สุด</p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-4 text-xs font-semibold text-green-700 hover:underline"
              >
                ส่งข้อความอีกครั้ง
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitTicket} className="space-y-4">
              {submitError && (
                <div className="rounded-lg bg-rose-50 border border-rose-100 text-rose-600 text-sm px-4 py-2.5">
                  {submitError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">หัวข้อ</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  placeholder="เช่น การจัดส่ง, การคืนสินค้า"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  เลขคำสั่งซื้อที่เกี่ยวข้อง (ถ้ามี)
                </label>
                {ordersLoading ? (
                  <div className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-400 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> กำลังโหลดคำสั่งซื้อของคุณ...
                  </div>
                ) : myOrders.length > 0 ? (
                  <select
                    value={form.relatedRef}
                    onChange={(e) => setForm((f) => ({ ...f, relatedRef: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600 bg-white"
                  >
                    <option value="">ไม่ระบุ / ไม่เกี่ยวกับคำสั่งซื้อ</option>
                    {myOrders.map((o) => {
                      const badge = toStatusBadge(o.status);
                      return (
                        <option key={o.id} value={o.id}>
                          {o.id} • {o.date} • {badge.label}
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  // ไม่มีคำสั่งซื้อเลย ก็ยังปล่อยให้พิมพ์เองได้ เผื่อลูกค้ามีเลขอ้างอิงจากช่องทางอื่น
                  <input
                    type="text"
                    value={form.relatedRef}
                    onChange={(e) => setForm((f) => ({ ...f, relatedRef: e.target.value }))}
                    placeholder="เช่น ORD-10231"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">รายละเอียด</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  rows={4}
                  placeholder="อธิบายปัญหาหรือคำถามของคุณ"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600 resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 bg-green-800 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> กำลังส่ง...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> ส่งข้อความ
                  </>
                )}
              </button>
            </form>
          )}
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