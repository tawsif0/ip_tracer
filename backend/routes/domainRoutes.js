const express = require("express");
const router = express.Router();
const domainController = require("../controllers/domainController");
const adminAuth = require("../middlewares/adminAuth");
const auth = require("../middlewares/auth");

// Admin-only routes
router.post("/", adminAuth, domainController.createDomain);
router.get("/", adminAuth, domainController.getAllDomains);
router.put("/:domainId", adminAuth, domainController.updateDomain);
router.delete("/:domainId", adminAuth, domainController.deleteDomain);
router.post(
  "/:domainId/assign/:userId",
  adminAuth,
  domainController.assignDomainToUser
);
// Add this route after the assign route
router.delete(
  "/:domainId/unassign/:userId",
  adminAuth,
  domainController.unassignDomainFromUser
);
// User routes
router.get("/user/available", auth, domainController.getUserDomains);

module.exports = router;
