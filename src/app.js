require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");

const tripRoutes = require("./routes/tripRoutes");
const weatherRoutes = require("./routes/weatherRoutes");
const authRoutes = require("./routes/authRoutes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Security middleware
app.use(helmet());

// Allows API access from tools like Postman
app.use(cors());

// Allows Express to read JSON request bodies with asasfe size limit
app.use(express.json({ limit: "10kb"}));

// Logs requests in the terminal
app.use(morgan("dev"));

// Limits repeated requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: "Too many requests, please try again later"
    });
  }
});

app.use(limiter);

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "OK",
    message: "Smart Travel Planner API is running"
  });
});

// Temporary homepage route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Smart Travel Planner API"
  });
});

// Auth routes
app.use("/api/v1/auth", authRoutes);

// Trip routes
app.use("/api/v1/trips", tripRoutes);

// Weather routes
app.use("/api/v1/weather", weatherRoutes);

// Handles wrong routes
app.use(notFound);

// Handles errors
app.use(errorHandler);

module.exports = app;