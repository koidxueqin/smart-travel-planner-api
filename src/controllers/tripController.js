const {
  createTripSchema,
  updateTripSchema
} = require("../validators/tripValidator");

const tripService = require("../services/tripService");
const AppError = require("../utils/AppError");

function validateTripId(id) {
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError("Trip ID must be a positive number", 400);
  }
}

function checkTripOwnership(trip, userId) {
  if (!trip) {
    throw new AppError("Trip not found", 404);
  }

  if (trip.userId !== userId) {
    throw new AppError("Access denied", 403);
  }
}

// Handles POST /api/v1/trips
async function createTrip(req, res, next) {
  try {
    const validatedData = createTripSchema.parse(req.body);

    const newTrip = await tripService.createTrip(validatedData, req.user.id);

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
    const trips = await tripService.getAllTrips(req.user.id);

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

    validateTripId(id);

    const trip = await tripService.getTripById(id);

    checkTripOwnership(trip, req.user.id);

    res.status(200).json({
      success: true,
      message: "Trip retrieved successfully",
      data: trip
    });
  } catch (error) {
    next(error);
  }
}

// Handles GET /api/v1/trips/:id/weather
async function getTripWithWeather(req, res, next) {
  try {
    const id = Number(req.params.id);

    validateTripId(id);

    const tripWithWeather = await tripService.getTripWithWeather(
      id,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: "Trip with weather fetched successfully",
      data: tripWithWeather
    });
  } catch (error) {
    next(error);
  }
}

// Handles PUT /api/v1/trips/:id
async function updateTrip(req, res, next) {
  try {
    const id = Number(req.params.id);

    validateTripId(id);

    const existingTrip = await tripService.getTripById(id);

    checkTripOwnership(existingTrip, req.user.id);

    const validatedData = updateTripSchema.parse(req.body);

    const updatedTrip = await tripService.updateTrip(
      id,
      validatedData,
      req.user.id
    );

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

    validateTripId(id);

    const existingTrip = await tripService.getTripById(id);

    checkTripOwnership(existingTrip, req.user.id);

    await tripService.deleteTrip(id, req.user.id);

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