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
router.post("/:shortCode/track-with-photo", linkController.trackVisitWithPhoto);
// Public redirect route (now handles tracking internally)
router.get("/:shortCode", ipDetection, linkController.redirectLink);
module.exports = router;
