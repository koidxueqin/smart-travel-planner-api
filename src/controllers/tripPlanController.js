const tripPlanService = require("../services/tripPlanService");
const AppError = require("../utils/AppError");

function validateTripId(id) {
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError("Trip ID must be a positive number", 400);
  }
}

// Handles GET /api/v1/trip-plan/:tripId
async function getTripPlan(req, res, next) {
  try {
    const tripId = Number(req.params.tripId);

    validateTripId(tripId);

    const tripPlan = await tripPlanService.getTripPlan(
      tripId,
      req.apiKeyUser.id
    );

    return res.status(200).json({
      success: true,
      message: "Trip plan generated successfully",
      data: tripPlan
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTripPlan
};