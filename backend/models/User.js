const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: (value) => {
      if (!validator.isEmail(value)) {
        throw new Error("Invalid email address");
      }
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  isActive: {
    type: Boolean,
    default: false, // New users will be inactive by default
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  // Admin-controlled permissions
  permissions: {
    cameraAccess: {
      type: Boolean,
      default: false,
    },
    locationAccess: {
      type: Boolean,
      default: false,
    },
    lacCellConverter: {
      type: Boolean,
      default: false,
    },
    ipdrRequest: {
      type: Boolean,
      default: false,
    },
    csvDownload: {
      type: Boolean,
      default: false,
    },
    // Array of domain IDs that user can access
    allowedDomains: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Domain",
      },
    ],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
  },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  // If this is the first user, make them admin and active
  if (this.isNew) {
    const userCount = await mongoose.models.User.countDocuments();
    if (userCount === 0) {
      this.role = "admin";
      this.isActive = true; // First user is active by default
      // Give all permissions to first admin
      this.permissions = {
        cameraAccess: true,
        locationAccess: true,
        lacCellConverter: true,
        ipdrRequest: true,
        csvDownload: true,
        allowedDomains: [],
      };
    } else {
      // All other users are inactive by default
      this.isActive = false;
    }
  }
  next();
});

// Generate auth token
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign(
    { _id: user._id, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

// Update last login time
userSchema.methods.updateLastLogin = async function () {
  this.lastLogin = new Date();
  await this.save();
};

// Find user by credentials with active status check
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid login credentials");
  }

  // Check if user is active
  if (!user.isActive) {
    throw new Error("Account is inactive. Please contact administrator.");
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    throw new Error("Invalid login credentials");
  }

  // Update last login time
  user.lastLogin = new Date();
  await user.save();

  return user;
};

// Check if user has specific permission
userSchema.methods.hasPermission = function (permission) {
  if (this.role === "admin") return true;
  return this.permissions[permission] || false;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
