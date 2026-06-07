const AppError = require("../utils/AppError");

// Authorise access based on users roles
function authorizeRoles(...allowedRoles) {
  return function (req, res, next) {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError("Access denied", 403));
    }

    next();
  };
}

module.exports = authorizeRoles;