const express = require("express");
const router = express.Router();

const controller = require("./lectureReport.controller");
const { protect } = require("../../middleware/auth.middleware");

router.get(
  "/penalty-report",
  protect,
  controller.penaltyReport
);

module.exports = router;
