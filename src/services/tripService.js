const connectDatabase = require("../config/database");

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

module.exports = {
  createTrip,
  getAllTrips,
  getTripById
};