const connectDatabase = require("../config/database");
const weatherService = require("./weatherService");
const AppError = require("../utils/AppError");
const { buildTravelSummary } = require("../utils/weatherAdvice");
const { encryptText, decryptText } = require("../utils/encryption");

// Decrypt one trip before returning it to the API response
function decryptTrip(trip) {
  if (!trip) {
    return trip;
  }

  return {
    ...trip,
    notes: decryptText(trip.notes),
    preferences: decryptText(trip.preferences)
  };
}

// Decrypt many trips before returning them to the API response
function decryptTrips(trips) {
  return trips.map(decryptTrip);
}

// Saves a new trip into SQLite for the logged-in user
async function createTrip(tripData, userId) {
  const db = await connectDatabase();

  const result = await db.run(
    `
    INSERT INTO trips (
      user_id,
      destination,
      country,
      start_date,
      end_date,
      notes,
      preferences
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      userId,
      tripData.destination,
      tripData.country,
      tripData.startDate,
      tripData.endDate,
      encryptText(tripData.notes),
      encryptText(tripData.preferences)
    ]
  );

  const newTrip = await getTripById(result.lastID);

  return newTrip;
}

// Get all trips belonging to one user
async function getAllTrips(userId) {
  const db = await connectDatabase();

  const trips = await db.all(
    `
    SELECT
      id,
      user_id AS userId,
      destination,
      country,
      start_date AS startDate,
      end_date AS endDate,
      notes,
      preferences,
      created_at AS createdAt,
      updated_at AS updatedAt
    FROM trips
    WHERE user_id = ?
    ORDER BY id DESC
    `,
    [userId]
  );

  return decryptTrips(trips);
}

// Admin only: get all trips from all users
async function getAllTripsForAdmin() {
  const db = await connectDatabase();

  const trips = await db.all(
    `
    SELECT
      trips.id,
      trips.user_id AS userId,
      users.name AS userName,
      users.email AS userEmail,
      users.role AS userRole,
      trips.destination,
      trips.country,
      trips.start_date AS startDate,
      trips.end_date AS endDate,
      trips.notes,
      trips.preferences,
      trips.created_at AS createdAt,
      trips.updated_at AS updatedAt
    FROM trips
    LEFT JOIN users ON trips.user_id = users.id
    ORDER BY trips.id DESC
    `
  );

  return decryptTrips(trips);
}

// Get one trip by ID
async function getTripById(id) {
  const db = await connectDatabase();

  const trip = await db.get(
    `
    SELECT
      id,
      user_id AS userId,
      destination,
      country,
      start_date AS startDate,
      end_date AS endDate,
      notes,
      preferences,
      created_at AS createdAt,
      updated_at AS updatedAt
    FROM trips
    WHERE id = ?
    `,
    [id]
  );

  return decryptTrip(trip);
}

// Get trip with weather and travel summary by ID, only if it belongs to the user
async function getTripWithWeather(id, userId) {
  const trip = await getTripById(id);

  if (!trip) {
    throw new AppError("Trip not found", 404);
  }

  if (trip.userId !== userId) {
    throw new AppError("Access denied", 403);
  }

  const weather = await weatherService.getWeatherByCity(trip.destination);
  const travelSummary = buildTravelSummary(weather);

  return {
    trip,
    weather,
    travelSummary
  };
}

// Update one trip by ID, only if it belongs to the user
async function updateTrip(id, tripData, userId) {
  const db = await connectDatabase();

  const result = await db.run(
    `
    UPDATE trips
    SET
      destination = ?,
      country = ?,
      start_date = ?,
      end_date = ?,
      notes = ?,
      preferences = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
    `,
    [
      tripData.destination,
      tripData.country,
      tripData.startDate,
      tripData.endDate,
      encryptText(tripData.notes),
      encryptText(tripData.preferences),
      id,
      userId
    ]
  );

  if (result.changes === 0) {
    throw new AppError("Access denied", 403);
  }

  const updatedTrip = await getTripById(id);

  return updatedTrip;
}

// Delete one trip by ID, only if it belongs to the user
async function deleteTrip(id, userId) {
  const db = await connectDatabase();

  const result = await db.run(
    `
    DELETE FROM trips
    WHERE id = ? AND user_id = ?
    `,
    [id, userId]
  );

  if (result.changes === 0) {
    throw new AppError("Access denied", 403);
  }

  return true;
}

module.exports = {
  createTrip,
  getAllTrips,
  getAllTripsForAdmin,
  getTripById,
  updateTrip,
  deleteTrip,
  getTripWithWeather
};