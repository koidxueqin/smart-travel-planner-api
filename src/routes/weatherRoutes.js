const express = require("express");
const weatherController = require("../controllers/weatherController");

const router = express.Router();

// Public route for testing OpenWeatherMap integration directly
router.get("/", weatherController.getWeather);

module.exports = router;