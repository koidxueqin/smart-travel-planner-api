const tripService = require("../services/tripService");

// Handles GET /api/v1/admin/trips
async function getAllTrips(req, res, next) {
  try {
    const trips = await tripService.getAllTripsForAdmin();

    res.status(200).json({
      success: true,
      message: "All trips retrieved successfully",
      count: trips.length,
      data: trips
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllTrips
};