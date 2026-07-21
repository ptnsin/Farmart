// controllers/orderController.js
const orderModel = require("../models/orderModel");
const shipmentModel = require("../models/shipmentModel");
const productModel = require("../models/productModel");
const notificationModel = require("../models/notificationModel");

// order.status -> shipment.status ที่ต้อง sync ไปด้วยทุกครั้งที่ order เปลี่ยนสถานะผ่าน endpoint นี้
// (shipmentModel.js sync กลับมาหา order ทางเดียวอยู่แล้วผ่าน syncOrderStatus แต่ order -> shipment
//  ไม่มีใครทำ ทำให้ก่อนหน้านี้พนักงานกด "เตรียมพัสดุ"/"กำลังจัดส่ง" จากหน้าคำสั่งซื้อแล้ว order.status
//  เปลี่ยนจริง แต่ไม่มี shipment ถูกสร้าง/อัปเดตให้ หน้าการขนส่งเลยไม่เห็นออเดอร์นั้นเลย)
const ORDER_TO_SHIPMENT_STATUS = {
  preparing: "preparing",
  shipping: "in_transit",
  delivered: "delivered",
};

// จำนวนวันที่ใช้คำนวณ ETA เริ่มต้นของ shipment ตอน auto-create ให้ตรงกับตัวเลือกวิธีจัดส่งที่ลูกค้า
// เลือกไว้ตอน Checkout (ดู SHIPPING_METHODS ใน Checkout.jsx: standard "3-5 วันทำการ", express "1-2 วันทำการ")
// ใช้ค่าสูงสุดของแต่ละช่วงเพื่อไม่ให้ ETA ที่แสดงดูเร็วเกินจริง
const DELIVERY_ETA_DAYS = { standard: 5, express: 2 };

// ข้อความแจ้งเตือนตาม "status" ที่เปลี่ยน (ใช้กับ updateStatus/updateOrder)
// type ต้องเป็น "orderUpdates" ให้ตรงกับ NotificationBell.jsx (NOTIF_TYPE_META) และ
// notifyPreferences ของ user (Profile.jsx / AdminSettings.jsx) ไม่งั้นจะไม่ขึ้นไอคอนที่ถูกต้อง/โดนกรองทิ้ง
const STATUS_NOTIFY_CONTENT = {
  approved: {
    title: (order) => `คำสั่งซื้อ ${order.id} ได้รับการอนุมัติ`,
    message: () => "คำสั่งซื้อของคุณได้รับการตรวจสอบและอนุมัติจากพนักงานเรียบร้อยแล้ว กำลังเตรียมจัดส่งให้คุณเร็ว ๆ นี้",
  },
  rejected: {
    title: (order) => `คำสั่งซื้อ ${order.id} ถูกปฏิเสธ`,
    message: () => "ขออภัย คำสั่งซื้อของคุณไม่ผ่านการตรวจสอบ กรุณาติดต่อฝ่ายบริการลูกค้าหากมีข้อสงสัย",
  },
};

// ข้อความแจ้งเตือนตาม "statusStep" ที่เลื่อนไป (ใช้กับ advance()) — เขียนให้ตรงกับ
// รูปแบบข้อความจริงที่มีอยู่แล้วใน data/notifications.json (ORD-10259/10260)
const STEP_NOTIFY_CONTENT = {
  1: {
    title: (order) => `คำสั่งซื้อ ${order.id} กำลังเตรียมพัสดุ`,
    message: () => "เจ้าหน้าที่กำลังจัดเตรียมสินค้าของคุณ จะแจ้งเตือนอีกครั้งเมื่อเริ่มจัดส่ง",
  },
  2: {
    title: (order) => `คำสั่งซื้อ ${order.id} กำลังจัดส่ง`,
    message: () => "พัสดุของคุณออกเดินทางแล้ว กรุณาเตรียมรับสินค้า",
  },
  3: {
    title: (order) => `คำสั่งซื้อ ${order.id} ถึงจุดหมายแล้ว`,
    message: () => "พัสดุของคุณจัดส่งถึงที่อยู่ปลายทางเรียบร้อยแล้ว ขอบคุณที่ใช้บริการ Farmart",
  },
  4: {
    title: (order) => `คำสั่งซื้อ ${order.id} จัดส่งสำเร็จ`,
    message: () => "คำสั่งซื้อของคุณจัดส่งสำเร็จเรียบร้อยแล้ว ขอบคุณที่ใช้บริการ Farmart",
  },
};

/** สร้างแจ้งเตือนให้ลูกค้าเจ้าของออเดอร์ (ไม่ทำให้ request หลักล้มเหลวถ้าแจ้งเตือนพัง) */
function notifyOrder(order, content) {
  try {
    if (!content || !order) return;
    notificationModel.addNotification({
      userId: order.userId,
      type: "orderUpdates",
      title: content.title(order),
      message: content.message(order),
    });
  } catch (err) {
    console.error("แจ้งเตือนลูกค้าเรื่องสถานะคำสั่งซื้อไม่สำเร็จ:", err.message);
  }
}

/** สร้าง/อัปเดต shipment ของ order ให้ตรงกับสถานะล่าสุด ถ้า status ที่เปลี่ยนไปไม่เกี่ยวกับการขนส่ง (เช่น rejected/cancelled) จะไม่ทำอะไร */
function syncShipmentForOrder(order, status) {
  const shipmentStatus = ORDER_TO_SHIPMENT_STATUS[status];
  if (!shipmentStatus || !order) return;

  const existing = shipmentModel.getShipments().find((s) => s.order === order.id);
  if (existing) {
    if (existing.status !== shipmentStatus) {
      shipmentModel.updateShipment(existing.id, { status: shipmentStatus });
    }
    return;
  }

  // ยังไม่มี shipment ผูกกับ order นี้เลย -> สร้างใหม่ (createShipment ตั้งสถานะเริ่มต้นเป็น "preparing" เสมอ)
  // ใส่ eta default ให้ด้วย (ไม่งั้น createShipment จะปล่อยเป็นค่าว่าง "" ทำให้ EmployeeShipping.jsx
  // formatEta() คืนค่า null แล้วซ่อนแถว "กำหนดส่ง" ไปทั้งบรรทัด) — คำนวณตาม deliveryMethod ของ order
  const etaDays = DELIVERY_ETA_DAYS[order.deliveryMethod] ?? DELIVERY_ETA_DAYS.standard;
  const defaultEta = new Date(Date.now() + etaDays * 24 * 60 * 60 * 1000).toISOString();
  const created = shipmentModel.createShipment({ order: order.id, eta: defaultEta });
  if (shipmentStatus !== "preparing") {
    shipmentModel.updateShipment(created.id, { status: shipmentStatus });
  }
}

function isStaff(user) {
  return user.role === "EMPLOYEE" || user.role === "ADMIN";
}

/** GET /api/orders - ลูกค้าเห็นเฉพาะของตัวเอง / employee-admin เห็นทั้งหมด รองรับ query: status */
function getOrders(req, res) {
  let orders = isStaff(req.user) ? orderModel.getOrders() : orderModel.getOrdersByUser(req.user.id);

  const { status } = req.query;
  if (status) {
    orders = orders.filter((o) => o.status === status);
  }

  res.json({ orders, total: orders.length });
}

/** GET /api/orders/:id */
function getOrderById(req, res) {
  const order = orderModel.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: "ไม่พบคำสั่งซื้อ" });

  if (!isStaff(req.user) && order.userId !== req.user.id) {
    return res.status(403).json({ error: "ไม่มีสิทธิ์เข้าถึงคำสั่งซื้อนี้" });
  }
  res.json({ order });
}

/** POST /api/orders - สร้างคำสั่งซื้อใหม่ (checkout) เฉพาะ CUSTOMER ที่ login แล้ว */
function createOrder(req, res) {
  const { items, address, paymentMethod, deliveryMethod } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "ตะกร้าสินค้าว่างเปล่า" });
  }
  for (const item of items) {
    if (!item.productId || !item.quantity || Number(item.quantity) <= 0 || item.price === undefined) {
      return res.status(400).json({ error: "รายการสินค้าในตะกร้าไม่ถูกต้อง" });
    }
  }

  // เช็คสต็อกคงเหลือก่อนตัดจริง กันสั่งเกินจำนวนที่มี (ก่อนหน้านี้ไม่มีการเช็ค/ตัดสต็อกเลย
  // ทำให้สั่งซื้อได้ไม่จำกัดและ stockUnits ไม่เคยลดหลัง checkout)
  for (const item of items) {
    const product = productModel.getProductById(item.productId);
    if (!product) {
      return res.status(400).json({ error: `ไม่พบสินค้ารหัส ${item.productId}` });
    }
    if (Number(product.stockUnits) < Number(item.quantity)) {
      return res.status(400).json({ error: `สินค้า "${product.name}" มีไม่พอในสต็อก (เหลือ ${product.stockUnits} ${product.unit})` });
    }
  }

  const order = orderModel.createOrder({
    userId: req.user.id,
    customer: req.user.name,
    items,
    address,
    paymentMethod,
    deliveryMethod,
  });

  // ตัดสต็อกของแต่ละสินค้าตามจำนวนที่สั่ง หลังสร้างออเดอร์สำเร็จ
  for (const item of items) {
    productModel.decreaseStock(item.productId, item.quantity);
  }

  res.status(201).json({ order });
}

/** PUT /api/orders/:id (employee/admin) - แก้ไขคำสั่งซื้อแบบทั่วไป */
function updateOrder(req, res) {
  const existing = orderModel.getOrderById(req.params.id);
  if (!existing) return res.status(404).json({ error: "ไม่พบคำสั่งซื้อ" });

  const patch = { ...req.body };
  if (patch.status && !Object.keys(orderModel.STATUS_META).includes(patch.status)) {
    return res.status(400).json({ error: "status ไม่ถูกต้อง" });
  }

  const order = orderModel.updateOrder(req.params.id, patch);

  if (patch.status) {
    syncShipmentForOrder(order, patch.status);
    // แจ้งเตือนเฉพาะตอนสถานะเปลี่ยนจริง กันแจ้งซ้ำถ้า PUT มาด้วย status เดิม
    if (existing.status !== patch.status) {
      notifyOrder(order, STATUS_NOTIFY_CONTENT[patch.status]);
    }
  }

  res.json({ order });
}

/** DELETE /api/orders/:id (employee/admin) */
function deleteOrder(req, res) {
  const existing = orderModel.getOrderById(req.params.id);
  if (!existing) return res.status(404).json({ error: "ไม่พบคำสั่งซื้อ" });

  const orders = orderModel.deleteOrder(req.params.id);
  res.json({ orders, message: "ลบคำสั่งซื้อเรียบร้อยแล้ว" });
}

/** PATCH /api/orders/:id/status (employee/admin) - pending/approved/preparing/shipping/delivered/rejected/cancelled */
function updateStatus(req, res) {
  const { status } = req.body || {};
  if (!Object.keys(orderModel.STATUS_META).includes(status)) {
    return res.status(400).json({ error: "status ไม่ถูกต้อง" });
  }
  const order = orderModel.updateOrderStatus(req.params.id, status);
  if (!order) return res.status(404).json({ error: "ไม่พบคำสั่งซื้อ" });

  syncShipmentForOrder(order, status);
  notifyOrder(order, STATUS_NOTIFY_CONTENT[status]);

  res.json({ order });
}

/** PATCH /api/orders/:id/advance (employee/admin) - เลื่อนสถานะการจัดส่งไปขั้นถัดไป */
function advance(req, res) {
  const order = orderModel.advanceOrderStep(req.params.id);
  if (!order) return res.status(404).json({ error: "ไม่พบคำสั่งซื้อ" });

  notifyOrder(order, STEP_NOTIFY_CONTENT[order.statusStep]);

  res.json({ order });
}

/**
 * PATCH /api/orders/:id/cancel (ลูกค้าเจ้าของออเดอร์เท่านั้น) - ยกเลิกคำสั่งซื้อ
 * ยกเลิกได้เฉพาะก่อนเข้าสถานะ "กำลังจัดส่ง" (statusStep 2 ตาม STEP_LABELS ฝั่ง frontend:
 * 0 ยืนยันคำสั่งซื้อ, 1 เตรียมพัสดุ, 2 กำลังจัดส่ง, 3 ถึงจุดหมาย, 4 จัดส่งสำเร็จ)
 *
 * ตั้งใจไม่แก้ statusStep เดิม (เก็บไว้เป็นสถานะจัดส่งล่าสุดก่อนยกเลิก) แต่เพิ่มฟิลด์
 * `cancelled: true` แยกต่างหากเป็น source of truth แทน เพื่อไม่ให้ไปชนกับโค้ดอื่นที่
 * อ่าน statusStep เป็นตัวเลข 0-4 อยู่แล้ว (เช่น Tracking.jsx ที่เอาไปคำนวณตำแหน่งบนแผนที่)
 *
 * NOTE: ใช้ orderModel.updateOrder(id, patch) ตัวเดิมที่ updateOrder controller ใช้อยู่แล้ว
 * ไม่ได้เพิ่มฟังก์ชันใหม่ในโมเดล — ถ้า orderModel.updateOrder มีการ validate patch.status
 * เป็น whitelist ["pending","approved","rejected"] อยู่ภายใน (ไม่ใช่แค่ใน controller
 * ด้านบนนี้) จะต้องเพิ่ม "cancelled" เข้าไปใน whitelist นั้นด้วย ไม่งั้นจะถูก reject
 */
function cancelOrder(req, res) {
  const existing = orderModel.getOrderById(req.params.id);
  if (!existing) return res.status(404).json({ error: "ไม่พบคำสั่งซื้อ" });

  // เจ้าของออเดอร์เท่านั้นที่ยกเลิกเองได้ — staff มีเครื่องมือของตัวเองอยู่แล้ว
  // (PATCH /:id/status, PATCH /:id/advance, DELETE /:id)
  // เทียบแบบ coerce เป็น string กันปัญหา type ไม่ตรงกัน (เช่น req.user.id เป็น
  // string จาก JWT payload แต่ existing.userId เป็น number จากข้อมูลออเดอร์)
  if (String(existing.userId) !== String(req.user.id)) {
    return res.status(403).json({ error: "ไม่มีสิทธิ์ยกเลิกคำสั่งซื้อนี้" });
  }

  if (existing.cancelled) {
    return res.status(400).json({ error: "คำสั่งซื้อนี้ถูกยกเลิกไปแล้ว" });
  }

  if ((existing.statusStep ?? 0) >= 2) {
    return res.status(400).json({ error: "คำสั่งซื้อนี้อยู่ระหว่างจัดส่งแล้ว ไม่สามารถยกเลิกได้" });
  }

  const order = orderModel.updateOrder(req.params.id, {
    cancelled: true,
    status: "cancelled",
    statusLabel: "ยกเลิกแล้ว",
  });

  // คืนสต็อกสินค้าที่เคยถูกตัดไปตอนสร้างออเดอร์ กลับเข้าคลังเมื่อออเดอร์ถูกยกเลิก
  for (const item of existing.items || []) {
    productModel.restoreStock(item.productId, item.quantity);
  }

  res.json({ order });
}

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  updateStatus,
  advance,
  cancelOrder,
};
