const express = require("express");
const router = express.Router();
const {protect} = require("../../middleware/auth.middleware")
const {requireRole} = require("../../middleware/role.middleware")
const controller = require("./batch.controller");

// POST
router.post("/",protect,requireRole("SUPER_ADMIN","BRANCH_ADMIN"), controller.createBatch);

// GET
router.get("/",protect, controller.getBatches);
router.get("/:id",protect, controller.getBatchById);

// PUT
router.put("/:id",protect, controller.updateBatch);

// DELETE
router.delete("/:id",protect, controller.deleteBatch);

module.exports = router;
