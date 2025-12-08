const jwt = require("jsonwebtoken");
const User = require("../models/User");

const adminAuth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findById(decoded._id);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if user is admin
    if (user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    // Check if admin is active
    if (!user.isActive) {
      return res.status(403).json({ error: "Admin account is inactive" });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: "Please authenticate as admin" });
  }
};

module.exports = adminAuth;
