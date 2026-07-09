// models/shipmentModel.js
const db = require("../utils/db");
const SEED = require("../data/shipments.seed.json");

const NEXT_STATUS = { preparing: "in_transit", in_transit: "delivered" };

function getShipments() {
  return db.read("shipments", SEED);
}

function saveShipments(shipments) {
  return db.write("shipments", shipments);
}

function advanceShipment(id) {
  const shipments = getShipments().map((s) =>
    s.id === id && NEXT_STATUS[s.status] ? { ...s, status: NEXT_STATUS[s.status] } : s
  );
  saveShipments(shipments);
  return shipments.find((s) => s.id === id) || null;
}

function createShipment(data) {
  const shipments = getShipments();
  const nums = shipments.map((s) => Number(String(s.id).replace(/\D/g, ""))).filter((n) => !Number.isNaN(n));
  const nextNum = (nums.length ? Math.max(...nums) : 5520) + 1;
  const shipment = {
    id: `SHP-${nextNum}`,
    order: data.order,
    carrier: data.carrier || "Farmart Express",
    status: "preparing",
    eta: data.eta || "",
  };
  saveShipments([shipment, ...shipments]);
  return shipment;
}

module.exports = { getShipments, saveShipments, advanceShipment, createShipment };
