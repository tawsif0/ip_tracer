const mongoose = require("mongoose");

const geoLocationSchema = new mongoose.Schema(
  {
    country: { type: String, index: true },
    countryCode: { type: String, index: true },
    city: { type: String, index: true },
    region: { type: String, index: true },
    regionCode: String,
    postalCode: String,
    latitude: Number,
    longitude: Number,
    timezone: String,
    isp: String,
    organization: String,
    asn: String,
  },
  { _id: false }
);

const deviceSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["desktop", "mobile", "tablet", "bot", "other"],
      index: true,
    },
    os: { type: String, index: true },
    browser: { type: String, index: true },
    model: String,
    isMobile: Boolean,
    isBot: Boolean,
  },
  { _id: false }
);

const networkSchema = new mongoose.Schema(
  {
    ipVersion: { type: String, enum: ["IPv4", "IPv6"] },
    isLocal: Boolean,
    isp: String,
    organization: String,
    asn: String,
  },
  { _id: false }
);

const referrerSchema = new mongoose.Schema(
  {
    url: String,
    domain: { type: String, index: true },
    type: {
      type: String,
      enum: ["direct", "organic", "referral", "social", "email", "other"],
      index: true,
    },
  },
  { _id: false }
);

const visitSchema = new mongoose.Schema(
  {
    link: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Link",
      required: true,
      index: true,
    },
    publicIp: {
      type: String,
      required: true,
      index: true,
    },
    photo: {
      type: String, // Cloudinary URL
      default: null,
    },
    hasPhoto: {
      type: Boolean,
      default: false,
      index: true,
    },
    internalIp: {
      type: String,
      index: true,
    },
    userAgent: String,
    sessionId: {
      type: String,
      index: true,
    },
    device: deviceSchema,
    geo: geoLocationSchema,
    network: networkSchema,
    referrer: referrerSchema,
    headers: mongoose.Schema.Types.Mixed,
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtuals
visitSchema.virtual("geo.formattedAddress").get(function () {
  const parts = [];
  if (this.geo?.city) parts.push(this.geo.city);
  if (this.geo?.region) parts.push(this.geo.region);
  if (this.geo?.country) parts.push(this.geo.country);
  return parts.join(", ");
});

// Indexes
visitSchema.index({ "geo.country": 1 });
visitSchema.index({ "geo.city": 1 });
visitSchema.index({ "device.type": 1 });
visitSchema.index({ "device.os": 1 });
visitSchema.index({ "device.browser": 1 });
visitSchema.index({ "referrer.type": 1 });
visitSchema.index({ "referrer.domain": 1 });
visitSchema.index({ "network.isp": 1 });
visitSchema.index({ createdAt: 1 });

// Add pagination plugin
visitSchema.plugin(require("mongoose-paginate-v2"));

module.exports = mongoose.model("Visit", visitSchema);
