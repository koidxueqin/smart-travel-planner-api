const {
  registerSchema,
  loginSchema
} = require("../validators/authValidator");

const authService = require("../services/authService");

// Handles POST /api/v1/auth/register
async function register(req, res, next) {
  try {
    const validatedData = registerSchema.parse(req.body);

    const newUser = await authService.registerUser(validatedData);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: newUser
      }
    });
  } catch (error) {
    next(error);
  }
}

// Handles POST /api/v1/auth/login
async function login(req, res, next) {
  try {
    const validatedData = loginSchema.parse(req.body);

    const result = await authService.loginUser(validatedData);

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: {
        user: result.user,
        token: result.token
      }
    });
  } catch (error) {
    next(error);
  }
}

// Handles GET /api/v1/auth/me
async function getMe(req, res, next) {
  try {
    return res.status(200).json({
      success: true,
      message: "User profile retrieved successfully",
      data: {
        user: req.user
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  getMe
};