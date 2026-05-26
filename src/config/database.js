const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");
const path = require("path");

let db;

async function connectDatabase() {
  if (db) {
    return db;
  }

  db = await open({
    filename: path.join(__dirname, "../../data/travel.db"),
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      destination TEXT NOT NULL,
      country TEXT,
      start_date TEXT,
      end_date TEXT,
      notes TEXT,
      preferences TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log("SQLite database connected");

  return db;
}

module.exports = connectDatabase;