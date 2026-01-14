const express = require("express")
const router = express.Router();

const controller = require('./upload.controller');
const upload = require("../../middleware/upload.middleware");
const { protect } = require("../../middleware/auth.middleware");

router.post("/",protect,upload.single("file"),controller.uploadfile)

router.get("/data",protect,controller.getAllHistoricalData)

module.exports = router
