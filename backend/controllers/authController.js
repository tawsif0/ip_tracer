const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Email sending function
const sendEmail = async (mailOptions) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      ...mailOptions,
    });
  } catch (error) {
    console.error("Email sending error:", error);
    throw new Error("Email could not be sent");
  }
};

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    // Create new user (role will be set in pre-save hook)
    const user = new User({
      name,
      email,
      password,
    });

    await user.save();

    // Generate token
    const token = await user.generateAuthToken();

    // Send welcome email
    await sendEmail({
      to: user.email,
      subject: "Welcome to Link Tracker",
      html: `<h1>Welcome ${user.name}!</h1>
             <p>Your account has been successfully created.</p>
             <p>Your role: ${user.role}</p>`,
    });

    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Invalid login credentials" });
    }

    // Check if user is active
    if (!user.isActive) {
      return res
        .status(403)
        .json({ error: "Account is inactive. Please contact administrator." });
    }

    // Verify password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ error: "Invalid login credentials" });
    }

    const token = await user.generateAuthToken();
    await user.updateLastLogin();

    res.json({ user, token });
  } catch (error) {
    res.status(401).json({ error: "Invalid login credentials" });
  }
};

// Add this new function for admin to get all users
exports.getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const users = await User.find({})
      .select("-password -tokens -passwordResetToken -passwordResetExpires")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add function for admin to update user permissions
// In authController.js - update the updateUserPermissions function
exports.updateUserPermissions = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { userId } = req.params;
    const { permissions } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Store old permissions to check what changed
    const oldCameraAccess = user.permissions?.cameraAccess || false;
    const oldLocationAccess = user.permissions?.locationAccess || false;

    // Update permissions
    user.permissions = {
      ...user.permissions,
      ...permissions,
    };

    await user.save();

    // If camera access was removed, update all user's links
    if (oldCameraAccess === true && permissions.cameraAccess === false) {
      const Link = require("../models/Link");
      await Link.updateMany(
        { createdBy: userId, enableCamera: true },
        { $set: { enableCamera: false } }
      );
    }

    // If location access was removed, update all user's links
    if (oldLocationAccess === true && permissions.locationAccess === false) {
      const Link = require("../models/Link");
      await Link.updateMany(
        { createdBy: userId, enableLocation: true },
        { $set: { enableLocation: false } }
      );
    }

    res.json({
      message: "Permissions updated successfully",
      user,
      linksUpdated: {
        camera: oldCameraAccess === true && permissions.cameraAccess === false,
        location:
          oldLocationAccess === true && permissions.locationAccess === false,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Add function for admin to toggle user active status
exports.toggleUserStatus = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.isActive = isActive;
    await user.save();

    res.json({ message: "User status updated successfully", user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save();

    // Send email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>You requested a password reset for your Link Tracker account.</p>
          <p>Click the button below to reset your password (valid for 30 minutes):</p>
          <a href="${resetUrl}" 
             style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all;">${resetUrl}</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    res.json({ message: "Password reset link sent to email" });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ error: "Failed to send reset email" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: "Token is invalid or has expired" });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Update to new password
    user.password = newPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
exports.getUserProfile = async (req, res) => {
  res.json(req.user);
};
exports.getUserProfile = async (req, res) => {
  res.json(req.user);
};

exports.updateUserProfile = async (req, res) => {
  const updates = Object.keys(req.body);
  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();
    res.json(req.user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Add this function for admin to delete user
exports.deleteUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { userId } = req.params;

    // Prevent admin from deleting themselves
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
