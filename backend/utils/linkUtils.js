const crypto = require("crypto");

// Generate a random short code
exports.generateShortCode = (length = 6) => {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
};

// Validate URL
exports.validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
};
