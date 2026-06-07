const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");
const path = require("path");
const fs = require("fs");

let db;

// Checks whether a column already exists in a table
async function columnExists(database, tableName, columnName) {
  const columns = await database.all(`PRAGMA table_info(${tableName})`);
  return columns.some((column) => column.name === columnName);
}

// Separate SQLite database during automated tests
function getDatabaseFileName() {
  if (process.env.NODE_ENV === "test") {
    return "travel_test.db";
  }

  return "travel.db";
}

// Build database folder path and database file path
function getDatabasePath() {
  const dataDir = path.join(__dirname, "../../data");
  const databasePath = path.join(dataDir, getDatabaseFileName());

  return {
    dataDir,
    databasePath
  };
}

async function createTables(database) {
  // Enable SQLite foreign key support
  await database.exec("PRAGMA foreign_keys = ON");

  // Create registered users table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create user travel records table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      destination TEXT NOT NULL,
      country TEXT,
      start_date TEXT,
      end_date TEXT,
      notes TEXT,
      preferences TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // Add user_id only if missing in older databases
  const hasUserIdColumn = await columnExists(database, "trips", "user_id");

  if (!hasUserIdColumn) {
    await database.exec(`
      ALTER TABLE trips
      ADD COLUMN user_id INTEGER REFERENCES users(id)
    `);
  }
}

async function connectDatabase() {
  if (db) {
    return db;
  }

  const { dataDir, databasePath } = getDatabasePath();

  // Create data folder automatically if it does not exist
  await fs.promises.mkdir(dataDir, { recursive: true });

  db = await open({
    filename: databasePath,
    driver: sqlite3.Database
  });

  await createTables(db);

  if (process.env.NODE_ENV !== "test") {
    console.log("SQLite database connected");
  }

  return db;
}

// Clears database records during automated tests
async function clearDatabase() {
  const database = await connectDatabase();

  await database.exec(`
    DELETE FROM trips;
    DELETE FROM users;
    DELETE FROM sqlite_sequence WHERE name IN ('trips', 'users');
  `);
}

// Closes the active database connection after automated tests finish running
async function closeDatabase() {
  if (db) {
    await db.close();
    db = null;
  }
}

module.exports = connectDatabase;
module.exports.clearDatabase = clearDatabase;
module.exports.closeDatabase = closeDatabase;
module.exports.getDatabasePath = getDatabasePath;