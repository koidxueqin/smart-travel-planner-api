const { z } = require("zod");

// Date must follow YYYY-MM-DD format
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

// Check if date is empty or in correct format
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

// Optional date field
const optionalDate = z
  .string()
  .trim()
  .optional()
  .default("")
  .refine(isValidDate, {
    message: "Date must be a valid date in YYYY-MM-DD format"
  });


// Optional text field 
const optionalShortText = (fieldName, maxLength) =>
  z
    .string()
    .trim()
    .max(maxLength, `${fieldName} cannot exceed ${maxLength} characters`)
    .optional()
    .default("");

// Validation rules for both creating and updating trips
const tripBaseSchema = z.object({
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
});

// Add date range validation to a trip schema
function withDateRangeValidation(schema) {
  return schema.refine(
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
}

const createTripSchema = withDateRangeValidation(tripBaseSchema);

const updateTripSchema = withDateRangeValidation(tripBaseSchema);

module.exports = {
  createTripSchema,
  updateTripSchema
};