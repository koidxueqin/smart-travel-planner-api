const {
  createTripSchema,
  updateTripSchema
} = require("../validators/tripValidator");

const tripService = require("../services/tripService");
const AppError = require("../utils/AppError");
const { success } = require("zod");

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
      throw new AppError("Trip ID must be a positive number", 400);
    }

    const trip = await tripService.getTripById(id);

    // If no trip is found
    if (!trip) {
      throw new AppError("Trip not found", 404);
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

async function getTripWithWeather(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <=0) {
      throw new AppError("Invalid trip ID", 400);
    }

    const getTripWithWeather = await tripService.getTripWithWeather(id);

    return res.status(200).json({
      success: true,
      message: "Trip with weather fetched successfully",
      data: getTripWithWeather
    });
  } catch (error) {
    next(error);
  }
}

// Handles PUT /api/v1/trips/:id
async function updateTrip(req, res, next) {
  try {
    const id = Number(req.params.id);

    // Check if ID is valid
    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError("Trip ID must be a positive number", 400);
    }

    // Check if trip exists first
    const existingTrip = await tripService.getTripById(id);

    if (!existingTrip) {
      throw new AppError("Trip not found", 404);
    }

    // Validate request body
    const validatedData = updateTripSchema.parse(req.body);

    // Update trip in database
    const updatedTrip = await tripService.updateTrip(id, validatedData);

    res.status(200).json({
      success: true,
      message: "Trip updated successfully",
      data: updatedTrip
    });
  } catch (error) {
    next(error);
  }
}

// Handles DELETE /api/v1/trips/:id
async function deleteTrip(req, res, next) {
  try {
    const id = Number(req.params.id);

    // Check if ID is valid
    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError("Trip ID must be a positive number", 400);
    }

    // Check if trip exists first
    const existingTrip = await tripService.getTripById(id);

    if (!existingTrip) {
      throw new AppError("Trip not found", 404);
    }

    // Delete trip from database
    await tripService.deleteTrip(id);

    res.status(200).json({
      success: true,
      message: "Trip deleted successfully",
      data: existingTrip
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createTrip,
  getAllTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  getTripWithWeather
};