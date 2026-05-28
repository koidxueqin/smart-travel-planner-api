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

  // Use custom status code if provided
  const statusCode = error.statusCode || error.status || 500;

  // Only log unexpected server errors
  if (statusCode === 500) {
    console.error(error);
  }

  // Hide real server error details from the user
  const message =
    statusCode === 500
      ? "Something went wrong on the server"
      : error.message;

  return res.status(statusCode).json({
    success: false,
    message
  });
}

module.exports = errorHandler;