const apiKeyService = require("../services/apiKeyService");

// Authenticate request using x-api-key
async function authenticateApiKey(req, res, next) {
  try {
    const apiKey = req.headers["x-api-key"];

    const user = await apiKeyService.verifyApiKey(apiKey);

    req.apiKeyUser = user;

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = authenticateApiKey;