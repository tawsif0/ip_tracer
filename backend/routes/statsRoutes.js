const express = require("express");
const router = express.Router();
const statsController = require("../controllers/statsController");
const auth = require("../middlewares/auth");

router.get("/summary", auth, statsController.getStatsSummary);
router.get("/visits/:id", auth, statsController.getVisitLogs);
module.exports = router;
