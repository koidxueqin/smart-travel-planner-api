const connectDatabase = require("../config/database");
const weatherService = require("./weatherService");
const AppError = require("../utils/AppError");

// Saves a new trip into SQLite
async function createTrip(tripData) {
  const db = await connectDatabase();

  const result = await db.run(
    `
    INSERT INTO trips (
      destination,
      country,
      start_date,
      end_date,
      notes,
      preferences
    )
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      tripData.destination,
      tripData.country,
      tripData.startDate,
      tripData.endDate,
      tripData.notes,
      tripData.preferences
    ]
  );

  // Return the newly created trip
  const newTrip = await db.get(
    `
    SELECT
      id,
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
    [result.lastID]
  );

  return newTrip;
}

// Get all trips from the database
async function getAllTrips() {
  const db = await connectDatabase();

  const trips = await db.all(
    `
    SELECT
      id,
      destination,
      country,
      start_date AS startDate,
      end_date AS endDate,
      notes,
      preferences,
      created_at AS createdAt,
      updated_at AS updatedAt
    FROM trips
    ORDER BY id DESC
    `
  );

  return trips;
}

// Get one trip by ID from the database
async function getTripById(id) {
  const db = await connectDatabase();

  const trip = await db.get(
    `
    SELECT
      id,
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

  return trip;
}

// Get Trip wtih Weather by ID
async function getTripWithWeather(id) {
  const trip = await getTripById(id);

  if (!trip) {
    throw new AppError("Trip not found", 404);
  }

  const weather = await weatherService.getWeatherByCity(trip.destination);

  return {
    trip, 
    weather
  };
}

// Update one trip by ID
async function updateTrip(id, tripData) {
  const db = await connectDatabase();

  await db.run(
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
    WHERE id = ?
    `,
    [
      tripData.destination,
      tripData.country,
      tripData.startDate,
      tripData.endDate,
      tripData.notes,
      tripData.preferences,
      id
    ]
  );

  const updatedTrip = await db.get(
    `
    SELECT
      id,
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

  return updatedTrip;
}

// Delete one trip by ID
async function deleteTrip(id) {
  const db = await connectDatabase();

  await db.run(
    `
    DELETE FROM trips
    WHERE id = ?
    `,
    [id]
  );

  return true;
}

module.exports = {
  createTrip,
  getAllTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  getTripWithWeather
};