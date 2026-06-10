const tripService = require("./tripService");
const weatherService = require("./weatherService");
const AppError = require("../utils/AppError");
const { buildTravelSummary } = require("../utils/weatherAdvice");
const { buildPackingChecklist } = require("./packingListService");

// Generate a full trip plan using trip data, weather, travel advice, and packing checklist
async function getTripPlan(tripId, userId) {
  const trip = await tripService.getTripById(tripId);

  if (!trip) {
    throw new AppError("Trip not found", 404);
  }

  if (trip.userId !== userId) {
    throw new AppError("Access denied", 403);
  }

  const weather = await weatherService.getWeatherByCity(trip.destination);
  const travelSummary = buildTravelSummary(weather);
  const packingChecklist = buildPackingChecklist(weather);

  return {
    trip: {
      id: trip.id,
      destination: trip.destination,
      country: trip.country,
      startDate: trip.startDate,
      endDate: trip.endDate,
      notes: trip.notes,
      preferences: trip.preferences
    },
    weather: {
      city: weather.city,
      country: weather.country,
      temperature: weather.temperature,
      feelsLike: weather.feelsLike,
      description: weather.description,
      humidity: weather.humidity,
      windSpeed: weather.windSpeed
    },
    travelSummary,
    packingChecklist
  };
}

module.exports = {
  getTripPlan
};