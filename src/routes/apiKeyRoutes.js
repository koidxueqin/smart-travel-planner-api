const express = require("express");

const apiKeyController = require("../controllers/apiKeyController");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

// User must login first before generating API key
router.use(authenticate);

// Generate new API key
router.post("/", apiKeyController.createApiKey);

// View own API key records
router.get("/", apiKeyController.getMyApiKeys);

module.exports = router;