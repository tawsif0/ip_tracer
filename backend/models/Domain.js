const mongoose = require("mongoose");

const domainSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
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
  // Users who have access to this domain
  allowedUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  // All users can use this domain (public)
  isPublic: {
    type: Boolean,
    default: false,
  },
});

const Domain = mongoose.model("Domain", domainSchema);
module.exports = Domain;
