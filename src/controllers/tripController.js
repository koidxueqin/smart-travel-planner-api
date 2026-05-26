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

module.exports = {
  createTrip
};