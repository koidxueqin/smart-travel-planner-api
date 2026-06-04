const express = require("express");
const adminController = require("../controllers/adminController");
const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Admin-only route
router.get(
  "/trips",
  authenticate,
  authorizeRoles("admin"),
  adminController.getAllTrips
);

module.exports = router;