const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const auth = require("../middlewares/auth");
const adminAuth = require("../middlewares/adminAuth");

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);

// Admin-only routes
router.get("/users", adminAuth, authController.getAllUsers);
router.put(
  "/users/:userId/permissions",
  adminAuth,
  authController.updateUserPermissions
);
router.put("/users/:userId/status", adminAuth, authController.toggleUserStatus);
router.delete("/users/:userId", adminAuth, authController.deleteUser); // Add this line

// Protected routes
router.get("/profile", auth, authController.getUserProfile);
router.put("/profile", auth, authController.updateUserProfile);
router.put("/change-password", auth, authController.changePassword);

module.exports = router;
