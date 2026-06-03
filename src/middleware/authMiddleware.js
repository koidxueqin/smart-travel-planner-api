const jwt = require("jsonwebtoken");

const connectDatabase = require("../config/database");
const AppError = require("../utils/AppError");

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Authorization token is required", 401);
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new AppError("Authorization token is required", 401);
    }

    if (!process.env.JWT_SECRET) {
      throw new AppError("JWT secret is not configured", 500);
    }

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new AppError("Invalid or expired token", 401);
    }

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
      [decoded.id]
    );

    if (!user) {
      throw new AppError("Invalid or expired token", 401);
    }

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = authenticate;