// models/promotionModel.js
const db = require("../utils/db");
const SEED = require("../data/promotions.seed.json");

function getPromotions() {
  return db.read("promotions", SEED);
}

function savePromotions(promos) {
  return db.write("promotions", promos);
}

function addPromotion(data) {
  const promos = getPromotions();
  const id = db.nextId(promos);
  const promo = {
    id,
    code: data.code?.trim().toUpperCase() || `PROMO${id}`,
    description: data.description || "",
    type: data.type === "fixed" ? "fixed" : "percent",
    value: Number(data.value) || 0,
    period: data.period || "",
    status: data.status || "scheduled",
    used: 0,
  };
  savePromotions([promo, ...promos]);
  return promo;
}

function updatePromotion(id, patch) {
  const promos = getPromotions().map((p) => (p.id === Number(id) ? { ...p, ...patch, id: p.id } : p));
  savePromotions(promos);
  return promos.find((p) => p.id === Number(id)) || null;
}

function togglePromotionStatus(id) {
  const promos = getPromotions().map((p) => {
    if (p.id !== Number(id)) return p;
    const status = p.status === "active" ? "expired" : "active";
    return { ...p, status };
  });
  savePromotions(promos);
  return promos.find((p) => p.id === Number(id)) || null;
}

function deletePromotion(id) {
  const promos = getPromotions().filter((p) => p.id !== Number(id));
  savePromotions(promos);
  return promos;
}

function findByCode(code) {
  const target = code.trim().toUpperCase();
  return getPromotions().find((p) => p.code === target) || null;
}

module.exports = {
  getPromotions,
  savePromotions,
  addPromotion,
  updatePromotion,
  togglePromotionStatus,
  deletePromotion,
  findByCode,
};
