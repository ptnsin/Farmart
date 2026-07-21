import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImagePlus, X, ChevronLeft } from "lucide-react";
import EmployeeSidebar from "./EmployeeSidebar";
import { addProduct } from "../data/productStore";
import { api } from "../data/apiClient";
import EmployeeTopBar from "./EmployeeTopBar";

// รายการหมวดหมู่ตามข้อมูลสินค้าจริงในระบบ
// ตรวจสอบกับ products.json แล้ว (61 รายการ) มีครบ 10 หมวดหมู่ที่ใช้งานจริง
// เดิม list นี้ขาด "ยาฆ่าแมลง", "ยาฆ่าหญ้า", "ไม้ดอก", "ไม้ผล" ไป ทั้งที่มีสินค้าในคลังแล้ว
// (พนักงานเลยเพิ่มสินค้า 4 หมวดนี้ไม่ได้ ต้องเพิ่มให้ตรงกับของจริง)
const CATEGORIES = [
  "เมล็ดพันธุ์",
  "ฮอร์โมน",
  "ปุ๋ย",
  "ยาฆ่าแมลง",
  "ยาฆ่าหญ้า",
  "ไม้ดอก",
  "ไม้ผล",
  "อุปกรณ์จัดการดิน",
  "อุปกรณ์รดน้ำ",
  "กระถาง",
];

// รายชื่อจังหวัดของไทยทั้งหมด (ข้อมูลจริงตามการแบ่งเขตปกครอง ไม่ได้อิงจากสถิติการใช้งานหรือ
// การเดาว่าจังหวัดไหนเชี่ยวชาญอะไร) ใช้เป็นตัวช่วย autocomplete ในช่อง "แหล่งผลิต" เท่านั้น
// ช่องนี้ยังพิมพ์เองได้อิสระเสมอ ไม่ได้บังคับเลือกจากลิสต์นี้ (รวมถึงพิมพ์ชื่อประเทศต่างประเทศได้)
const THAI_PROVINCES = [
  "กรุงเทพมหานคร", "กระบี่", "กาญจนบุรี", "กาฬสินธุ์", "กำแพงเพชร", "ขอนแก่น",
  "จันทบุรี", "ฉะเชิงเทรา", "ชลบุรี", "ชัยนาท", "ชัยภูมิ", "ชุมพร",
  "เชียงราย", "เชียงใหม่", "ตรัง", "ตราด", "ตาก", "นครนายก",
  "นครปฐม", "นครพนม", "นครราชสีมา", "นครศรีธรรมราช", "นครสวรรค์", "นนทบุรี",
  "นราธิวาส", "น่าน", "บึงกาฬ", "บุรีรัมย์", "ปทุมธานี", "ประจวบคีรีขันธ์",
  "ปราจีนบุรี", "ปัตตานี", "พะเยา", "พังงา", "พัทลุง", "พิจิตร",
  "พิษณุโลก", "เพชรบุรี", "เพชรบูรณ์", "แพร่", "ภูเก็ต", "มหาสารคาม",
  "มุกดาหาร", "แม่ฮ่องสอน", "ยโสธร", "ยะลา", "ร้อยเอ็ด", "ระนอง",
  "ระยอง", "ราชบุรี", "ลพบุรี", "ลำปาง", "ลำพูน", "เลย",
  "ศรีสะเกษ", "สกลนคร", "สงขลา", "สตูล", "สมุทรปราการ", "สมุทรสงคราม",
  "สมุทรสาคร", "สระแก้ว", "สระบุรี", "สิงห์บุรี", "สุโขทัย", "สุพรรณบุรี",
  "สุราษฎร์ธานี", "สุรินทร์", "หนองคาย", "หนองบัวลำภู", "อ่างทอง", "อำนาจเจริญ",
  "อุดรธานี", "อุตรดิตถ์", "อุทัยธานี", "อุบลราชธานี",
];

export default function EmployeeProductAdd() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [form, setForm] = useState({
    name: "",
    category: CATEGORIES[0],
    unit: "",
    stock: "",
    price: "",
    cost: "",
    farmer: "",
    location: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [formErrors, setFormErrors] = useState({});

  // ตรวจความถูกต้องแบบพอดี ๆ: กันค่าที่ชัดเจนว่าผิด (ราคาติดลบ, ไม่กรอกชื่อ, จำนวนไม่ใช่ตัวเลข ฯลฯ)
  // แต่ "ผู้จำหน่าย" กับ "แหล่งผลิต" ปล่อยเป็นข้อความอิสระตามเดิม เพราะอาจเป็นชื่อ/สถานที่
  // จากต่างประเทศหรือรูปแบบที่คาดเดาล่วงหน้าไม่ได้ ไม่ควรบังคับรูปแบบตายตัว
  const validate = (values) => {
    const errs = {};
    const name = values.name.trim();
    if (!name) {
      errs.name = "กรุณากรอกชื่อสินค้า";
    } else if (name.length < 2) {
      errs.name = "ชื่อสินค้าสั้นเกินไป";
    } else if (name.length > 100) {
      errs.name = "ชื่อสินค้ายาวเกินไป (ไม่เกิน 100 ตัวอักษร)";
    } else if (!/[ก-๙a-zA-Z]/.test(name)) {
      errs.name = "ชื่อสินค้าต้องมีตัวอักษร ไม่ใช่ตัวเลขหรือสัญลักษณ์ล้วน";
    }

    if (values.price === "" || Number.isNaN(Number(values.price))) {
      errs.price = "กรุณากรอกราคาต่อหน่วยเป็นตัวเลข";
    } else if (Number(values.price) <= 0) {
      errs.price = "ราคาต่อหน่วยต้องมากกว่า 0";
    } else if (Number(values.price) > 1000000) {
      errs.price = "ราคาต่อหน่วยสูงผิดปกติ กรุณาตรวจสอบอีกครั้ง";
    }

    if (values.cost !== "") {
      if (Number.isNaN(Number(values.cost))) {
        errs.cost = "ต้นทุนต่อหน่วยต้องเป็นตัวเลข";
      } else if (Number(values.cost) < 0) {
        errs.cost = "ต้นทุนต่อหน่วยต้องไม่ติดลบ";
      }
    }

    if (values.stock === "" || Number.isNaN(Number(values.stock))) {
      errs.stock = "กรุณากรอกจำนวนคงเหลือเป็นตัวเลข";
    } else if (!Number.isInteger(Number(values.stock))) {
      errs.stock = "จำนวนคงเหลือต้องเป็นจำนวนเต็ม";
    } else if (Number(values.stock) < 0) {
      errs.stock = "จำนวนคงเหลือต้องไม่ติดลบ";
    }

    if (!values.description.trim()) {
      errs.description = "กรุณากรอกรายละเอียดสินค้า";
    } else if (values.description.trim().length < 10) {
      errs.description = "อธิบายรายละเอียดให้มากกว่านี้อีกนิด (อย่างน้อย 10 ตัวอักษร)";
    }

    return errs;
  };

  // กันพิมพ์ -, +, e ในช่องตัวเลข (ราคา/ต้นทุน/จำนวน) เพราะ input type="number"
  // เปิดให้พิมพ์อักขระพวกนี้ได้อยู่ดีแม้จะมี min="0"
  const blockInvalidNumberKeys = (e) => {
    if (["-", "+", "e", "E"].includes(e.key)) e.preventDefault();
  };

  const handleField = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleImageChange = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleFileInput = (e) => {
    handleImageChange(e.target.files?.[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleImageChange(e.dataTransfer.files?.[0]);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError("");

    const errs = validate(form);
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    try {
      let imageUrl;
      if (imageFile) {
        setUploading(true);
        try {
          const formData = new FormData();
          formData.append("file", imageFile);
          const uploadResult = await api.post("/api/upload/product", formData);
          imageUrl = uploadResult.url;
        } catch (err) {
          setSaveError(err.message || "อัปโหลดรูปภาพไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
          setSaving(false);
          setUploading(false);
          return;
        }
        setUploading(false);
      }

      // backend จะตั้งสถานะ approvalStatus เป็น pending ให้เองสำหรับสินค้าที่พนักงานเพิ่ม
      await addProduct({
        name: form.name,
        category: form.category,
        unit: form.unit || "หน่วย",
        price: Number(form.price),
        cost: form.cost ? Number(form.cost) : undefined,
        stockUnits: Number(form.stock),
        farmer: form.farmer,
        location: form.location,
        description: form.description,
        ...(imageUrl ? { image: imageUrl, images: [imageUrl] } : {}),
      });
      navigate("/employee/warehouse");
    } catch (err) {
      setSaveError(err.message || "บันทึกสินค้าไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <EmployeeSidebar />

      <main className="flex-1 overflow-y-auto px-6 py-6 md:px-10">
        <EmployeeTopBar />

        {/* Heading */}
        <button
          type="button"
          onClick={() => navigate("/employee/warehouse")}
          className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ChevronLeft size={16} />
          กลับไปหน้าคลังสินค้า
        </button>
        <div className="mt-3">
          <h1 className="text-2xl font-semibold text-emerald-800">เพิ่มสินค้าใหม่</h1>
          <p className="mt-1 text-sm text-slate-400">
            กรอกรายละเอียดสินค้าและอัปโหลดรูปภาพเพื่อเพิ่มลงในคลังสินค้า
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3"
        >
          {/* Image upload */}
          <div className="rounded-xl border border-slate-100 bg-white p-5 lg:col-span-1">
            <p className="mb-3 text-sm font-medium text-slate-700">รูปภาพสินค้า</p>

            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="พรีวิวสินค้า"
                  className="h-56 w-full rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  aria-label="ลบรูปภาพ"
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/60 text-white hover:bg-slate-900/80"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="flex h-56 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 text-center hover:border-emerald-300 hover:bg-emerald-50/40"
              >
                <ImagePlus size={28} className="text-slate-400" />
                <p className="text-sm font-medium text-slate-600">
                  ลากรูปมาวาง หรือคลิกเพื่อเลือกไฟล์
                </p>
                <p className="text-xs text-slate-400">PNG, JPG ขนาดไม่เกิน 5MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </label>
            )}

            {imagePreview && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 w-full rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                เปลี่ยนรูปภาพ
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </button>
            )}
          </div>

          {/* Fields */}
          <div className="rounded-xl border border-slate-100 bg-white p-5 lg:col-span-2">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  ชื่อสินค้า
                </label>
                <input
                  required
                  value={form.name}
                  onChange={handleField("name")}
                  type="text"
                  placeholder="เช่น ข้าวหอมมะลิ 100%"
                  className={`w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:ring-2 ${
                    formErrors.name
                      ? "border-rose-400 focus:border-rose-400 focus:ring-rose-100"
                      : "border-slate-200 focus:border-emerald-400 focus:ring-emerald-100"
                  }`}
                />
                {formErrors.name && (
                  <p className="mt-1 text-xs text-rose-500">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  หมวดหมู่
                </label>
                <select
                  value={form.category}
                  onChange={handleField("category")}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  หน่วยนับ
                </label>
                <input
                  value={form.unit}
                  onChange={handleField("unit")}
                  type="text"
                  placeholder="เช่น ซอง, ขวด, ถุง 25 กก."
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  ราคาต่อหน่วย (บาท)
                </label>
                <input
                  required
                  value={form.price}
                  onChange={handleField("price")}
                  onKeyDown={blockInvalidNumberKeys}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className={`w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:ring-2 ${
                    formErrors.price
                      ? "border-rose-400 focus:border-rose-400 focus:ring-rose-100"
                      : "border-slate-200 focus:border-emerald-400 focus:ring-emerald-100"
                  }`}
                />
                {formErrors.price && (
                  <p className="mt-1 text-xs text-rose-500">{formErrors.price}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  ต้นทุนต่อหน่วย (บาท)
                </label>
                <input
                  value={form.cost}
                  onChange={handleField("cost")}
                  onKeyDown={blockInvalidNumberKeys}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00 (ไม่บังคับ)"
                  className={`w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:ring-2 ${
                    formErrors.cost
                      ? "border-rose-400 focus:border-rose-400 focus:ring-rose-100"
                      : "border-slate-200 focus:border-emerald-400 focus:ring-emerald-100"
                  }`}
                />
                {formErrors.cost && (
                  <p className="mt-1 text-xs text-rose-500">{formErrors.cost}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  จำนวนคงเหลือ
                </label>
                <input
                  required
                  value={form.stock}
                  onChange={handleField("stock")}
                  onKeyDown={blockInvalidNumberKeys}
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  className={`w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:ring-2 ${
                    formErrors.stock
                      ? "border-rose-400 focus:border-rose-400 focus:ring-rose-100"
                      : "border-slate-200 focus:border-emerald-400 focus:ring-emerald-100"
                  }`}
                />
                {formErrors.stock && (
                  <p className="mt-1 text-xs text-rose-500">{formErrors.stock}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  ผู้จำหน่าย
                </label>
                <input
                  value={form.farmer}
                  onChange={handleField("farmer")}
                  type="text"
                  placeholder="ชื่อผู้ผลิตหรือผู้จำหน่าย"
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  แหล่งผลิต
                </label>
                <input
                  value={form.location}
                  onChange={handleField("location")}
                  type="text"
                  list="location-suggestions"
                  placeholder="เช่น เชียงใหม่ หรือ Chiang Mai, Thailand"
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />
                <datalist id="location-suggestions">
                  {THAI_PROVINCES.map((loc) => (
                    <option key={loc} value={loc} />
                  ))}
                </datalist>
                <p className="mt-1.5 text-xs text-slate-400">
                  พิมพ์ 1-2 ตัวจะมีรายชื่อจังหวัดขึ้นให้เลือก หรือพิมพ์เองได้อิสระถ้าเป็นแหล่งผลิตจากต่างประเทศ
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  รายละเอียดสินค้า
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={handleField("description")}
                  placeholder="อธิบายรายละเอียดสินค้า"
                  className={`w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:ring-2 ${
                    formErrors.description
                      ? "border-rose-400 focus:border-rose-400 focus:ring-rose-100"
                      : "border-slate-200 focus:border-emerald-400 focus:ring-emerald-100"
                  }`}
                />
                {formErrors.description && (
                  <p className="mt-1 text-xs text-rose-500">{formErrors.description}</p>
                )}
              </div>
            </div>

            {saveError && <p className="mt-4 text-sm text-rose-500">{saveError}</p>}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/employee/warehouse")}
                disabled={saving}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
              >
                {uploading ? "กำลังอัปโหลดรูป..." : saving ? "กำลังบันทึก..." : "บันทึกสินค้า"}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}