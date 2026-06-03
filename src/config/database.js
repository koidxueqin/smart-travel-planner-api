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

async function connectDatabase() {
  if (db) {
    return db;
  }

  const dataDir = path.join(__dirname, "../../data");
  const databasePath = path.join(dataDir, "travel.db");

  // Create data folder automatically if it does not exist
  await fs.promises.mkdir(dataDir, { recursive: true });

  db = await open({
    filename: databasePath,
    driver: sqlite3.Database
  });

  // Enable SQLite foreign key support
  await db.exec("PRAGMA foreign_keys = ON");

  // Create users table
  await db.exec(`
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

  // Temporary default user for Day 13
  // This keeps existing trip CRUD working before authentication is added
  await db.run(
    `
    INSERT OR IGNORE INTO users (
      id,
      name,
      email,
      password_hash,
      role
    )
    VALUES (?, ?, ?, ?, ?)
    `,
    [
      1,
      "Default User",
      "default@example.com",
      "temporary-password-hash",
      "user"
    ]
  );

  // Create trips table for new databases
  await db.exec(`
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

  // Safe migration for existing databases
  // If trips table already existed before Day 13, add user_id only if missing
  const hasUserIdColumn = await columnExists(db, "trips", "user_id");

  if (!hasUserIdColumn) {
    await db.exec(`
      ALTER TABLE trips
      ADD COLUMN user_id INTEGER REFERENCES users(id)
    `);
  }

  // Attach old trips to the temporary default user
  await db.run(`
    UPDATE trips
    SET user_id = 1
    WHERE user_id IS NULL
  `);

  console.log("SQLite database connected");

  return db;
}

module.exports = connectDatabase;