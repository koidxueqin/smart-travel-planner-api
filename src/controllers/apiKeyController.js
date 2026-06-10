const apiKeyService = require("../services/apiKeyService");

// Handles POST /api/v1/api-keys
async function createApiKey(req, res, next) {
  try {
    const apiKey = await apiKeyService.createApiKey(req.user.id);

    return res.status(201).json({
      success: true,
      message: "API key generated successfully",
      data: apiKey
    });
  } catch (error) {
    next(error);
  }
}

// Handles GET /api/v1/api-keys
async function getMyApiKeys(req, res, next) {
  try {
    const apiKeys = await apiKeyService.getUserApiKeys(req.user.id);

    return res.status(200).json({
      success: true,
      message: "API keys retrieved successfully",
      count: apiKeys.length,
      data: apiKeys
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createApiKey,
  getMyApiKeys
};