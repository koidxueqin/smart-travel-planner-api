const tripService = require("./tripService");
const weatherService = require("./weatherService");
const AppError = require("../utils/AppError");

// Remove repeated checklist items
function removeDuplicates(items) {
    return [...new Set(items)];
}

// Build checklist using simple weather rules
function buildPackingChecklist(weather) {
    const checklist = [
        "Travel documents",
        "Phone charger",
        "Comfortable walking shoes",
        "Basic toiletries"
    ];

    const description = String(weather.description || "").toLowerCase();

    if (description.includes("rain") || description.includes("drizzle")) {
        checklist.push("Umbrella");
        checklist.push("Waterproof jacket");
    }

    if (description.includes("thunderstorm")) {
        checklist.push("Umbrella");
        checklist.push("Waterproof jacket");
        checklist.push("Indoor backup plan");
    }

    if (description.includes("snow")) {
        checklist.push("Warm jacket");
        checklist.push("Gloves");
        checklist.push("Thermal clothing");
        checklist.push("Ear muffs");
    }

    if (weather.temperature >= 30) {
        checklist.push("Sunscreen");
        checklist.push("Reusable water bottle");
        checklist.push("Light clothing");
        checklist.push("Sun hat");
    }

    if (weather.temperature <= 10) {
        checklist.push("Warm jacket");
        checklist.push("Scarf");
    }

    if (weather.windSpeed >= 10) {
        checklist.push("Windbreaker");
    }

    return removeDuplicates(checklist);
}

// Generate packing list for one trip

async function getPackingList(tripId, userId) {
  const trip = await tripService.getTripById(tripId);

  if (!trip) {
    throw new AppError("Trip not found", 404);
  }

  if (trip.userId !== userId) {
    throw new AppError("Access denied", 403);
  }

  const weather = await weatherService.getWeatherByCity(trip.destination);
  const checklist = buildPackingChecklist(weather);

  return {
    trip: {
      id: trip.id,
      destination: trip.destination,
      country: trip.country,
      startDate: trip.startDate,
      endDate: trip.endDate
    },
    weather: {
      description: weather.description,
      temperature: weather.temperature,
      humidity: weather.humidity,
      windSpeed: weather.windSpeed
    },
    checklist
  };
}

module.exports = {
  getPackingList
};