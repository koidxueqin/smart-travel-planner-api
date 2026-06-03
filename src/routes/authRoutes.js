const express = require("express");

const authController = require("../controllers/authController");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

// Register new user
router.post("/register", authController.register);

// Login user
router.post("/login", authController.login);

// Get logged-in user profile
router.get("/me", authenticate, authController.getMe);

module.exports = router;