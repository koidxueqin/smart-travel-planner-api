const { ZodError } = require("zod");

function errorHandler(error, req, res, next) {
  // Handles validation errors from Zod
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message
      }))
    });
  }

  // Shows real error in terminal for developer
  console.error(error);

  // Use custom status code if controller provides one
  const statusCode = error.statusCode || error.status || 500;

  // Hide message only for real server errors
  const message =
    statusCode === 500
      ? "Something went wrong on the server"
      : error.message;

  return res.status(statusCode).json({
    success: false,
    message: message
  });
}

module.exports = errorHandler;