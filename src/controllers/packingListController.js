const packingListService = require("../services/packingListService");
const AppError = require("../utils/AppError");

function validateTripId(id) {
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError("Trip ID must be a positive number", 400);
  }
}

// Handles GET /api/v1/packing-list/:tripId
async function getPackingList(req, res, next) {
  try {
    const tripId = Number(req.params.tripId);

    validateTripId(tripId);

    const packingList = await packingListService.getPackingList(
      tripId,
      req.apiKeyUser.id
    );

    return res.status(200).json({
      success: true,
      message: "Packing checklist generated successfully",
      data: packingList
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getPackingList
};