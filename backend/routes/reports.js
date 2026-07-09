const express = require("express");
const router = express.Router();
const productModel = require("../models/productModel");
const orderModel = require("../models/orderModel");
const userModel = require("../models/userModel");
const { requireRole } = require("../middleware/auth");

// GET /api/reports/summary  (employee/admin) - แดชบอร์ดยอดขาย/สต๊อก/สินค้าขายดี
router.get("/summary", requireRole("EMPLOYEE", "ADMIN"), (req, res) => {
  const products = productModel.getProducts();
  const orders = orderModel.getOrders();
  const users = userModel.getUsers();

  const totalRevenue = orders
    .filter((o) => o.status === "approved")
    .reduce((sum, o) => sum + Number(o.total || 0), 0);

  const lowStockProducts = products.filter((p) => p.stockLevel === "low" || p.stockPercent < 20);

  const productSalesCount = {};
  orders.forEach((o) => {
    (o.items || []).forEach((item) => {
      productSalesCount[item.productId] = (productSalesCount[item.productId] || 0) + Number(item.quantity || 0);
    });
  });
  const bestSellers = Object.entries(productSalesCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([productId, qty]) => {
      const product = products.find((p) => String(p.id) === String(productId));
      return { productId, name: product?.name || "ไม่ทราบชื่อสินค้า", quantitySold: qty };
    });

  res.json({
    totalRevenue,
    totalOrders: orders.length,
    totalProducts: products.length,
    totalCustomers: users.filter((u) => u.role === "CUSTOMER").length,
    lowStockCount: lowStockProducts.length,
    lowStockProducts,
    bestSellers,
    ordersByStatus: {
      pending: orders.filter((o) => o.status === "pending").length,
      approved: orders.filter((o) => o.status === "approved").length,
      rejected: orders.filter((o) => o.status === "rejected").length,
    },
  });
});

module.exports = router;
