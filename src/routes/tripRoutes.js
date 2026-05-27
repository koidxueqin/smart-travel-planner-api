const express = require("express");
const tripController = require("../controllers/tripController");

const router = express.Router();

// Create a new trip
router.post("/", tripController.createTrip);

// Get all trips
router.get("/", tripController.getAllTrips);

// Get one trip by ID
router.get("/:id", tripController.getTripById);

// Update one trip by ID
router.put("/:id", tripController.updateTrip);

module.exports = router;