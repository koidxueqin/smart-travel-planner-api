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

module.exports = {
  createTrip
};