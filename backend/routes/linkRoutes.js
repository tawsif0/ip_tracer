const express = require("express");
const router = express.Router();
const linkController = require("../controllers/linkController");
const auth = require("../middlewares/auth");
const ipDetection = require("../middlewares/ipDetection");

// Protected routes
router.post("/", auth, linkController.createLink);
router.get("/user", auth, linkController.getUserLinks);
router.put("/:id", auth, linkController.updateLink);
router.delete("/:id", auth, linkController.deleteLink);

// ONLY POST ROUTE for creating visit records
router.post("/:shortCode", ipDetection, linkController.redirectLink);

// Destination route (for getting URL without tracking)
router.get("/:shortCode/destination", linkController.getLinkDestination);

module.exports = router;
