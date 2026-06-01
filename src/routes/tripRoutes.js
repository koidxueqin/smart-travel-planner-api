const express = require("express");
const tripController = require("../controllers/tripController");

const router = express.Router();

// Create a new trip
router.post("/", tripController.createTrip);

// Get all trips
router.get("/", tripController.getAllTrips);

// Get trip with weather by ID
router.get("/:id/weather", tripController.getTripWithWeather);

// Get one trip by ID
router.get("/:id", tripController.getTripById);

// Update one trip by ID
router.put("/:id", tripController.updateTrip);

// Delete one trip by ID    
router.delete("/:id", tripController.deleteTrip);

module.exports = router;