const express = require("express");
const tripController = require("../controllers/tripController");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

// All trip routes require authentication because trips are user-specific
router.use(authenticate);

// Create a new trip
router.post("/", tripController.createTrip);

// Get all trips for the logged-in user
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