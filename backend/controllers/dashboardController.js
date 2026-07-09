// controllers/dashboardController.js
const productModel = require("../models/productModel");
const orderModel = require("../models/orderModel");
const userModel = require("../models/userModel");
const categoryModel = require("../models/categoryModel");

/**
 * GET /api/dashboard (employee/admin)
 * สรุปข้อมูลภาพรวมของระบบ:
 * - จำนวนผู้ใช้ทั้งหมด
 * - จำนวนสินค้า
 * - จำนวนคำสั่งซื้อ
 * - จำนวนหมวดหมู่สินค้า
 * - ยอดขายรวม
 * - จำนวนสินค้าคงเหลือ
 * - สินค้าขายดี
 * - ออเดอร์ล่าสุด
 */
function getDashboard(req, res) {
  const users = userModel.getUsers();
  const products = productModel.getProducts();
  const orders = orderModel.getOrders();
  const categories = categoryModel.getCategories();

  const approvedOrders = orders.filter((o) => o.status === "approved");
  const totalRevenue = approvedOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const totalStockUnits = products.reduce((sum, p) => sum + Number(p.stockUnits || 0), 0);

  // สินค้าขายดี 5 อันดับแรก
  const productSalesCount = {};
  orders.forEach((o) => {
    (o.items || []).forEach((item) => {
      productSalesCount[item.productId] =
        (productSalesCount[item.productId] || 0) + Number(item.quantity || 0);
    });
  });
  const bestSellingProducts = Object.entries(productSalesCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([productId, qty]) => {
      const product = products.find((p) => String(p.id) === String(productId));
      return { productId, name: product?.name || "ไม่ทราบชื่อสินค้า", quantitySold: qty };
    });

  // ออเดอร์ล่าสุด 10 รายการ
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10)
    .map((o) => ({
      id: o.id,
      customer: o.customer,
      total: o.total,
      status: o.status,
      date: o.date,
    }));

  res.json({
    totalUsers: users.length,
    totalProducts: products.length,
    totalOrders: orders.length,
    totalCategories: categories.length,
    totalRevenue,
    totalStockUnits,
    bestSellingProducts,
    recentOrders,
  });
}

module.exports = { getDashboard };
