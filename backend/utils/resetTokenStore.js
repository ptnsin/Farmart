// utils/resetTokenStore.js
const crypto = require("crypto");

const TOKEN_TTL_MS = 30 * 60 * 1000; // 30 นาที
const tokens = new Map(); // token -> { userId, expiresAt }

function createResetToken(userId) {
  const token = crypto.randomBytes(32).toString("hex");
  tokens.set(token, { userId, expiresAt: Date.now() + TOKEN_TTL_MS });
  return token;
}

function verifyResetToken(token) {
  const entry = tokens.get(token);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    tokens.delete(token);
    return null;
  }
  return entry.userId;
}

function consumeResetToken(token) {
  tokens.delete(token);
}

module.exports = { createResetToken, verifyResetToken, consumeResetToken };