const express = require("express");
const { protect } = require("../../middleware/auth.middleware");
const { requireRole } = require("../../middleware/role.middleware");
const router = express.Router();
const attendanceController = require("./attendance.controller");

router.post(
    "/lecture/attendance",
    protect,
    requireRole("BRANCH_ADMIN","SUPER_ADMIN"),
    attendanceController.markAttendance
)

module.exports = router