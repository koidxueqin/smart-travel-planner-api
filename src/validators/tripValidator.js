const { z } = require("zod");

// Date must follow YYYY-MM-DD format, example: 2026-06-10
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

function isValidDate(value) {
  if (value === "") {
    return true;
  }

  if (!dateRegex.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

const optionalDate = z
  .string()
  .trim()
  .optional()
  .default("")
  .refine(isValidDate, {
    message: "Date must be a valid date in YYYY-MM-DD format"
  });

const optionalShortText = (fieldName, maxLength) =>
  z
    .string()
    .trim()
    .max(maxLength, `${fieldName} cannot exceed ${maxLength} characters`)
    .optional()
    .default("");

// Validation rules for creating a trip
const createTripSchema = z
  .object({
    destination: z
      .string()
      .trim()
      .min(1, "Destination is required")
      .max(100, "Destination cannot exceed 100 characters"),

    country: optionalShortText("Country", 100),

    startDate: optionalDate,

    endDate: optionalDate,

    notes: optionalShortText("Notes", 500),

    preferences: optionalShortText("Preferences", 300)
  })
  .refine(
  (data) => {
    if (data.startDate === "" || data.endDate === "") {
      return true;
    }

    if (!isValidDate(data.startDate) || !isValidDate(data.endDate)) {
      return true;
    }

    return data.startDate <= data.endDate;
  },
  {
    message: "End date cannot be earlier than start date",
    path: ["endDate"]
  }
);

// Validation rules for updating a trip
const updateTripSchema = z
  .object({
    destination: z
      .string()
      .trim()
      .min(1, "Destination is required")
      .max(100, "Destination cannot exceed 100 characters"),

    country: optionalShortText("Country", 100),

    startDate: optionalDate,

    endDate: optionalDate,

    notes: optionalShortText("Notes", 500),

    preferences: optionalShortText("Preferences", 300)
  })
  .refine(
  (data) => {
    if (data.startDate === "" || data.endDate === "") {
      return true;
    }

    if (!isValidDate(data.startDate) || !isValidDate(data.endDate)) {
      return true;
    }

    return data.startDate <= data.endDate;
  },
  {
    message: "End date cannot be earlier than start date",
    path: ["endDate"]
  }
);

module.exports = {
  createTripSchema,
  updateTripSchema
};