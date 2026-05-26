const express = require("express");
const tripController = require("../controllers/tripController");

const router = express.Router();

// Create a new trip
router.post("/", tripController.createTrip);

module.exports = router;