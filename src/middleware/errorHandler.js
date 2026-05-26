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

  // Sends safe error message to user
  return res.status(500).json({
    success: false,
    message: "Something went wrong on the server"
  });
}

module.exports = errorHandler;