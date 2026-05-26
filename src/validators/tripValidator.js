const { z } = require("zod");

// Date must follow YYYY-MM-DD format, example: 2026-06-10
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const optionalDate = z
  .string()
  .trim()
  .optional()
  .default("")
  .refine((value) => value === "" || dateRegex.test(value), {
    message: "Date must be in YYYY-MM-DD format"
  });

// Validation rules for creating a trip
const createTripSchema = z.object({
  destination: z
    .string()
    .trim()
    .min(1, "Destination is required"),

  country: z
    .string()
    .trim()
    .optional()
    .default(""),

  startDate: optionalDate,

  endDate: optionalDate,

  notes: z
    .string()
    .trim()
    .optional()
    .default(""),

  preferences: z
    .string()
    .trim()
    .optional()
    .default("")
});

module.exports = {
  createTripSchema
};