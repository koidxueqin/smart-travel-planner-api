const express = require("express");

const packingListController = require("../controllers/packingListController");
const authenticateApiKey = require("../middleware/apiKeyMiddleware");

const router = express.Router();

// Packing List API requires custom API key
router.get("/:tripId", authenticateApiKey, packingListController.getPackingList);

module.exports = router;