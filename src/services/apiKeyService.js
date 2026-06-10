const crypto = require("crypto");

const connectDatabase = require("../config/database");
const AppError = require("../utils/AppError");

const API_KEY_LENGTH = 8;
const API_KEY_EXPIRY_DAYS = 90;
const API_KEY_CHARACTERS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

// Generate API key using crypto
function generateApiKey() {
  let apiKey = "";

  for (let i = 0; i < API_KEY_LENGTH; i += 1) {
    const randomIndex = crypto.randomInt(0, API_KEY_CHARACTERS.length);
    apiKey += API_KEY_CHARACTERS[randomIndex];
  }

  return apiKey;
}

// Hash API key before storing it
function hashApiKey(apiKey) {
  return crypto.createHash("sha256").update(apiKey).digest("hex");
}

// Create expiry date 90 days from now
function getExpiryDate() {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + API_KEY_EXPIRY_DAYS);
  return expiryDate.toISOString();
}

// Create new API key for logged-in user
async function createApiKey(userId) {
  const db = await connectDatabase();

  const apiKey = generateApiKey();
  const keyHash = hashApiKey(apiKey);
  const expiresAt = getExpiryDate();

  const result = await db.run(
    `
    INSERT INTO api_keys (
      user_id,
      key_hash,
      expires_at
    )
    VALUES (?, ?, ?)
    `,
    [userId, keyHash, expiresAt]
  );

  return {
    id: result.lastID,
    apiKey,
    expiresAt
  };
}

// Get API key records for logged-in user
async function getUserApiKeys(userId) {
  const db = await connectDatabase();

  const apiKeys = await db.all(
    `
    SELECT
      id,
      expires_at AS expiresAt,
      created_at AS createdAt
    FROM api_keys
    WHERE user_id = ?
    ORDER BY id DESC
    `,
    [userId]
  );

  return apiKeys;
}

// Verify API key from x-api-key header
async function verifyApiKey(apiKey) {
  if (!apiKey || apiKey.trim() === "") {
    throw new AppError("API key is required", 401);
  }

  const db = await connectDatabase();
  const keyHash = hashApiKey(apiKey);

  const apiKeyRecord = await db.get(
    `
    SELECT
      api_keys.id,
      api_keys.user_id AS userId,
      api_keys.expires_at AS expiresAt,
      users.name,
      users.email,
      users.role
    FROM api_keys
    JOIN users ON api_keys.user_id = users.id
    WHERE api_keys.key_hash = ?
    `,
    [keyHash]
  );

  if (!apiKeyRecord) {
    throw new AppError("Invalid API key", 401);
  }

  const expiryDate = new Date(apiKeyRecord.expiresAt);

  if (expiryDate <= new Date()) {
    throw new AppError("API key has expired", 401);
  }

  return {
    id: apiKeyRecord.userId,
    name: apiKeyRecord.name,
    email: apiKeyRecord.email,
    role: apiKeyRecord.role
  };
}

module.exports = {
  createApiKey,
  getUserApiKeys,
  verifyApiKey
};