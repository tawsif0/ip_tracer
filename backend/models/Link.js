const mongoose = require("mongoose");

const linkSchema = new mongoose.Schema({
  shortCode: {
    type: String,
    required: true,
    unique: true,
  },
  originalUrl: {
    type: String,
    required: true,
  },
  domain: {
    type: String,
    required: true,
  },
  enableCamera: {
    type: Boolean,
    default: false,
  },
  enableLocation: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  meta: {
    title: String,
    description: String,
  },
});

// Add pre-save middleware to update updatedAt
linkSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Link", linkSchema);
