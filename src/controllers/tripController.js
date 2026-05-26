const { createTripSchema } = require("../validators/tripValidator");
const tripService = require("../services/tripService");

// Handles POST /api/v1/trips
async function createTrip(req, res, next) {
  try {
    // Validate request body
    const validatedData = createTripSchema.parse(req.body);

    // Save trip into database
    const newTrip = await tripService.createTrip(validatedData);

    res.status(201).json({
      success: true,
      message: "Trip created successfully",
      data: newTrip
    });
  } catch (error) {
    next(error);
  }
}

// Handles GET /api/v1/trips
async function getAllTrips(req, res, next) {
  try {
    const trips = await tripService.getAllTrips();

    res.status(200).json({
      success: true,
      message: "Trips retrieved successfully",
      count: trips.length,
      data: trips
    });
  } catch (error) {
    next(error);
  }
}

// Handles GET /api/v1/trips/:id
async function getTripById(req, res, next) {
  try {
    const id = Number(req.params.id);

    // Check if ID is valid
    if (!Number.isInteger(id) || id <= 0) {
      const error = new Error("Trip ID must be a positive number");
      error.statusCode = 400;
      throw error;
    }

    const trip = await tripService.getTripById(id);

    // If no trip is found
    if (!trip) {
      const error = new Error("Trip not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: "Trip retrieved successfully",
      data: trip
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createTrip,
  getAllTrips,
  getTripById
};