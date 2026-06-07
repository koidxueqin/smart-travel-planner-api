const { z } = require("zod");

// Validate user registration input
const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name cannot exceed 100 characters"),

  email: z
    .string()
    .trim()
    .email("Email must be valid")
    .max(150, "Email cannot exceed 150 characters")
    .transform((value) => value.toLowerCase()),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password cannot exceed 100 characters")
});

// Validate login input
const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Email must be valid")
    .transform((value) => value.toLowerCase()),

  password: z
    .string()
    .min(1, "Password is required")
    .max(100, "Password cannot exceed 100 characters")
});

module.exports = {
  registerSchema,
  loginSchema
};