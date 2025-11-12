const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const auth = require("../middlewares/auth");

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);

// Protected routes
router.get("/profile", auth, authController.getUserProfile);
router.put("/profile", auth, authController.updateUserProfile);

module.exports = router;
