// controllers/reportController.js
const productModel = require("../models/productModel");
const orderModel = require("../models/orderModel");
const userModel = require("../models/userModel");
const categoryModel = require("../models/categoryModel");

/** สรุปสินค้าขายดี 5 อันดับแรกจากคำสั่งซื้อทั้งหมด */
function calculateBestSellers(products, orders, limit = 5) {
  const productSalesCount = {};
  orders.forEach((o) => {
    (o.items || []).forEach((item) => {
      productSalesCount[item.productId] =
        (productSalesCount[item.productId] || 0) + Number(item.quantity || 0);
    });
  });

  return Object.entries(productSalesCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([productId, qty]) => {
      const product = products.find((p) => String(p.id) === String(productId));
      return {
        productId,
        name: product?.name || "ไม่ทราบชื่อสินค้า",
        quantitySold: qty,
        revenue: product ? Number(product.price) * qty : 0,
      };
    });
}

/** GET /api/reports/dashboard (employee/admin) - ภาพรวมระบบทั้งหมด */
function getDashboardReport(req, res) {
  const products = productModel.getProducts();
  const orders = orderModel.getOrders();
  const users = userModel.getUsers();
  const categories = categoryModel.getCategories();

  const approvedOrders = orders.filter((o) => o.status === "approved");
  const totalRevenue = approvedOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const totalStockUnits = products.reduce((sum, p) => sum + Number(p.stockUnits || 0), 0);
  const bestSellers = calculateBestSellers(products, orders);
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  res.json({
    totalUsers: users.length,
    totalProducts: products.length,
    totalOrders: orders.length,
    totalCategories: categories.length,
    totalRevenue,
    totalStockUnits,
    bestSellers,
    recentOrders,
    ordersByStatus: {
      pending: orders.filter((o) => o.status === "pending").length,
      approved: orders.filter((o) => o.status === "approved").length,
      rejected: orders.filter((o) => o.status === "rejected").length,
    },
  });
}

/** GET /api/reports/sales (employee/admin) - รายงานยอดขาย รองรับ query: from, to (YYYY-MM-DD) */
function getSalesReport(req, res) {
  const { from, to } = req.query;
  let orders = orderModel.getOrders();

  if (from) {
    orders = orders.filter((o) => o.date >= from);
  }
  if (to) {
    orders = orders.filter((o) => o.date <= to);
  }

  const approvedOrders = orders.filter((o) => o.status === "approved");
  const totalRevenue = approvedOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);

  const salesByDate = {};
  approvedOrders.forEach((o) => {
    salesByDate[o.date] = (salesByDate[o.date] || 0) + Number(o.total || 0);
  });
  const dailySales = Object.entries(salesByDate)
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([date, total]) => ({ date, total }));

  const products = productModel.getProducts();
  const bestSellers = calculateBestSellers(products, approvedOrders, 10);

  res.json({
    totalOrders: orders.length,
    approvedOrders: approvedOrders.length,
    rejectedOrders: orders.filter((o) => o.status === "rejected").length,
    pendingOrders: orders.filter((o) => o.status === "pending").length,
    totalRevenue,
    averageOrderValue: approvedOrders.length ? totalRevenue / approvedOrders.length : 0,
    dailySales,
    bestSellers,
  });
}

/** GET /api/reports/inventory (employee/admin) - รายงานสต๊อกสินค้า */
function getInventoryReport(req, res) {
  const products = productModel.getProducts();

  const lowStockProducts = products.filter((p) => p.stockLevel === "low" || p.stockPercent < 20);
  const outOfStockProducts = products.filter((p) => Number(p.stockUnits) === 0);
  const totalStockUnits = products.reduce((sum, p) => sum + Number(p.stockUnits || 0), 0);
  const totalStockValue = products.reduce(
    (sum, p) => sum + Number(p.stockUnits || 0) * Number(p.cost || 0),
    0
  );

  const byCategory = {};
  products.forEach((p) => {
    if (!byCategory[p.category]) {
      byCategory[p.category] = { category: p.category, productCount: 0, stockUnits: 0 };
    }
    byCategory[p.category].productCount += 1;
    byCategory[p.category].stockUnits += Number(p.stockUnits || 0);
  });

  res.json({
    totalProducts: products.length,
    totalStockUnits,
    totalStockValue,
    lowStockCount: lowStockProducts.length,
    lowStockProducts,
    outOfStockCount: outOfStockProducts.length,
    outOfStockProducts,
    byCategory: Object.values(byCategory),
  });
}

module.exports = { getDashboardReport, getSalesReport, getInventoryReport };
