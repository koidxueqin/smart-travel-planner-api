const AppError = require("../utils/AppError");

// Handle requests to routes that do not exist
function notFound(req, res, next) {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
}

module.exports = notFound;