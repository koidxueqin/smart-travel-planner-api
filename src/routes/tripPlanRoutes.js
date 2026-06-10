const express = require("express");

const tripPlanController = require("../controllers/tripPlanController");
const authenticateApiKey = require("../middleware/apiKeyMiddleware");

const router = express.Router();

// Trip Plan API requires custom API key
router.get("/:tripId", authenticateApiKey, tripPlanController.getTripPlan);

module.exports = router;