const express = require("express")
const router = express.Router();

const controller = require('./staffUpload.controller');
const upload = require("../../middleware/upload.middleware");
const { protect } = require("../../middleware/auth.middleware");

router.post("/",protect,upload.single("file"),controller.staffUploadData)

// router.get("/data",protect,controller.getAllHistoricalData)

module.exports = router
