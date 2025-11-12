// middlewares/ipDetection.js
const requestIp = require("request-ip");
const UAParser = require("ua-parser-js");
const { v4: uuidv4 } = require("uuid");

const parseReferrer = (referrer) => {
  if (!referrer || referrer === "direct") {
    return { type: "direct", domain: null, url: null };
  }

  try {
    const url = new URL(referrer);
    const domain = url.hostname;

    let type = "other";
    const socialDomains = [
      "facebook.com",
      "twitter.com",
      "instagram.com",
      "linkedin.com",
      "youtube.com",
      "tiktok.com",
      "pinterest.com"
    ];
    const searchEngines = [
      "google.",
      "bing.",
      "yahoo.",
      "duckduckgo.",
      "baidu."
    ];

    if (socialDomains.some((social) => domain.includes(social))) {
      type = "social";
    } else if (searchEngines.some((engine) => domain.includes(engine))) {
      type = "organic";
    } else if (domain) {
      type = "referral";
    }

    return { type, domain, url: referrer };
  } catch (error) {
    return { type: "other", domain: null, url: referrer };
  }
};

const getDeviceInfo = (userAgent) => {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  let type = "other";
  if (result.device.type) {
    type = result.device.type;
  } else {
    type = "desktop";
  }

  return {
    type,
    os: result.os.name || "Unknown",
    browser: result.browser.name || "Unknown",
    model: result.device.model || "Unknown",
    isMobile: type === "mobile" || type === "tablet",
    isBot: !!result.device.type === "bot" || /bot|crawl|spider/i.test(userAgent)
  };
};

const ipDetection = async (req, res, next) => {
  try {
    // Get client IP
    const publicIp =
      requestIp.getClientIp(req) || req.ip || req.connection.remoteAddress;
    const internalIp = req.connection.remoteAddress || req.socket.remoteAddress;

    // Parse user agent
    const userAgent = req.get("User-Agent") || "";
    const device = getDeviceInfo(userAgent);

    // Parse referrer
    const referrer = parseReferrer(req.get("referer"));

    // Generate session ID
    const sessionId = uuidv4();

    // Store all tracking data in request object
    req.trackingData = {
      ipInfo: {
        publicIp,
        internalIp
      },
      device,
      referrer,
      headers: req.headers,
      sessionId
    };

    next();
  } catch (error) {
    console.error("IP detection error:", error);
    // Continue even if tracking fails
    next();
  }
};

module.exports = ipDetection;
