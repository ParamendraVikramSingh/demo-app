const crypto = require("crypto");

function normalizeMessage(message = "") {
  return message
    // replace numbers
    .replace(/\b\d+\b/g, "{num}")
    // replace Mongo ObjectIds
    .replace(/\b[a-f0-9]{24}\b/gi, "{objectId}")
    // replace UUIDs
    .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, "{uuid}")
    // replace emails
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "{email}")
    // trim spaces
    .replace(/\s+/g, " ")
    .trim();
}

function createLogFingerprint(log = {}) {
  const message = normalizeMessage(log.message || "");
  const errorName = log.error?.name || log.errorName || "";
  const route = log.route || "";
  const method = log.method || "";
  const module = log.module || "";
  const statusCode = log.statusCode || "";
  const level = log.level || "";

  const base = [
    level,
    errorName,
    message,
    route,
    method,
    module,
    statusCode
  ].join("|");

  return crypto.createHash("md5").update(base).digest("hex");
}

module.exports = { createLogFingerprint, normalizeMessage };