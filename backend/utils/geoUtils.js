const axios = require("axios");

// Detect internal IP through 3-step redirect
exports.detectInternalIp = async (req) => {
  try {
    // First request - initial redirect
    if (!req.query.step) {
      return null;
    }

    // Second request - capture X-Forwarded-For
    if (req.query.step === "1") {
      return req.headers["x-forwarded-for"] || null;
    }

    // Third request - final redirect
    if (req.query.step === "2") {
      return req.headers["x-forwarded-for"] || null;
    }

    return null;
  } catch (error) {
    console.error("Error detecting internal IP:", error);
    return null;
  }
};

// Get geolocation data from IP
exports.getGeoData = async (ip) => {
  try {
    if (
      ip === "127.0.0.1" ||
      ip.startsWith("192.168.") ||
      ip.startsWith("10.")
    ) {
      return null;
    }

    const response = await axios.get(`http://ip-api.com/json/${ip}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching geo data:", error);
    return null;
  }
};
