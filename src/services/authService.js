const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const connectDatabase = require("../config/database");
const AppError = require("../utils/AppError");

const SALT_ROUNDS = 10;
const JWT_EXPIRES_IN = "1h";

// Create a JWT access token for authenticated user
function createToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new AppError("JWT secret is not configured", 500);
  }

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN
    }
  );
}

// Get user details without exposing password hash
async function getUserById(id) {
  const db = await connectDatabase();

  const user = await db.get(
    `
    SELECT
      id,
      name,
      email,
      role,
      created_at AS createdAt,
      updated_at AS updatedAt
    FROM users
    WHERE id = ?
    `,
    [id]
  );

  return user;
}

// Register a new user account
async function registerUser(userData) {
  const db = await connectDatabase();

  const existingUser = await db.get(
    `
    SELECT id
    FROM users
    WHERE email = ?
    `,
    [userData.email]
  );

  if (existingUser) {
    throw new AppError("Email already exists", 409);
  }

  const passwordHash = await bcrypt.hash(userData.password, SALT_ROUNDS);

  const result = await db.run(
    `
    INSERT INTO users (
      name,
      email,
      password_hash
    )
    VALUES (?, ?, ?)
    `,
    [
      userData.name,
      userData.email,
      passwordHash
    ]
  );

  const newUser = await getUserById(result.lastID);

  return newUser;
}

// Check password and login
async function loginUser(loginData) {
  const db = await connectDatabase();

  const user = await db.get(
    `
    SELECT
      id,
      name,
      email,
      password_hash AS passwordHash,
      role,
      created_at AS createdAt,
      updated_at AS updatedAt
    FROM users
    WHERE email = ?
    `,
    [loginData.email]
  );

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  let isPasswordCorrect = false;

  try {
    isPasswordCorrect = await bcrypt.compare(
      loginData.password,
      user.passwordHash
    );
  } catch {
    isPasswordCorrect = false;
  }

  if (!isPasswordCorrect) {
    throw new AppError("Invalid email or password", 401);
  }

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };

  const token = createToken(safeUser);

  return {
    user: safeUser,
    token
  };
}

module.exports = {
  registerUser,
  loginUser,
  getUserById
};