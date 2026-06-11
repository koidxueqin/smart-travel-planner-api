// Mock the weather service so tests do not depend on the real OpenWeatherMap API
jest.mock("../src/services/weatherService", () => ({
  getWeatherByCity: jest.fn()
}));

const connectDatabase = require("../src/config/database");
const {
  request,
  app,
  registerAndLogin,
  createTestTrip
} = require("./testUtils");

const weatherService = require("../src/services/weatherService");

const { clearDatabase, closeDatabase } = connectDatabase;

// Helper function to create a trip for the logged-in user
async function createTrip(token, tripData = {}) {
  const response = await request(app)
    .post("/api/v1/trips")
    .set("Authorization", `Bearer ${token}`)
    .send(createTestTrip(tripData));

  return response;
}

// Helper function to generate an API key for the logged-in user
async function generateApiKey(token) {
  const response = await request(app)
    .post("/api/v1/api-keys")
    .set("Authorization", `Bearer ${token}`);

  return response;
}

describe("Packing List API", () => {
  beforeEach(async () => {
    // Clear previous mock calls
    jest.clearAllMocks();

    // Reset database before each test
    await clearDatabase();

    // Mock weather data used to generate the packing checklist
    weatherService.getWeatherByCity.mockResolvedValue({
      city: "London",
      country: "GB",
      temperature: 18,
      feelsLike: 17,
      description: "light rain",
      humidity: 70,
      windSpeed: 4
    });
  });

  afterAll(async () => {
    // Close database connection after all tests finish
    await closeDatabase();
  });

  test("GET /api/v1/packing-list/:tripId should return packing checklist with valid API key", async () => {
    // Register and log in a test user
    const { token } = await registerAndLogin();

    // Create a trip for the user
    const tripResponse = await createTrip(token);

    // Generate an API key for the same user
    const apiKeyResponse = await generateApiKey(token);

    const tripId = tripResponse.body.data.id;
    const apiKey = apiKeyResponse.body.data.apiKey;

    // Request packing list using the API key
    const response = await request(app)
      .get(`/api/v1/packing-list/${tripId}`)
      .set("x-api-key", apiKey);

    // Check successful response
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Packing checklist generated successfully");

    // Check main response sections
    expect(response.body.data.trip).toBeDefined();
    expect(response.body.data.weather).toBeDefined();
    expect(response.body.data.checklist).toBeDefined();

    // Check trip data
    expect(response.body.data.trip.id).toBe(tripId);
    expect(response.body.data.trip.destination).toBe("London");

    // Check mocked weather data
    expect(response.body.data.weather.description).toBe("light rain");

    // Check checklist output
    expect(Array.isArray(response.body.data.checklist)).toBe(true);
    expect(response.body.data.checklist).toContain("Travel documents");
    expect(response.body.data.checklist).toContain("Umbrella");
    expect(response.body.data.checklist).toContain("Waterproof jacket");
  });

  test("GET /api/v1/packing-list/:tripId should fail without API key", async () => {
    // Packing list route requires x-api-key
    const response = await request(app).get("/api/v1/packing-list/1");

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("API key is required");
  });

  test("GET /api/v1/packing-list/:tripId should fail with wrong API key", async () => {
    // Send an invalid API key
    const response = await request(app)
      .get("/api/v1/packing-list/1")
      .set("x-api-key", "wrong123");

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid API key");
  });

  test("GET /api/v1/packing-list/:tripId should fail with invalid trip ID", async () => {
    const { token } = await registerAndLogin();

    // Generate a valid API key first
    const apiKeyResponse = await generateApiKey(token);
    const apiKey = apiKeyResponse.body.data.apiKey;

    // Use an invalid non-number trip ID
    const response = await request(app)
      .get("/api/v1/packing-list/abc")
      .set("x-api-key", apiKey);

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Trip ID must be a positive number");
  });

  test("GET /api/v1/packing-list/:tripId should fail when trip does not exist", async () => {
    const { token } = await registerAndLogin();

    // Generate a valid API key first
    const apiKeyResponse = await generateApiKey(token);
    const apiKey = apiKeyResponse.body.data.apiKey;

    // Use a trip ID that does not exist
    const response = await request(app)
      .get("/api/v1/packing-list/9999")
      .set("x-api-key", apiKey);

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Trip not found");
  });

  test("GET /api/v1/packing-list/:tripId should block another user's trip", async () => {
    // Create two separate users
    const userOne = await registerAndLogin();
    const userTwo = await registerAndLogin();

    // User one creates a trip
    const tripResponse = await createTrip(userOne.token);
    const tripId = tripResponse.body.data.id;

    // User two generates their own API key
    const apiKeyResponse = await generateApiKey(userTwo.token);
    const userTwoApiKey = apiKeyResponse.body.data.apiKey;

    // User two tries to access user one's packing list
    const response = await request(app)
      .get(`/api/v1/packing-list/${tripId}`)
      .set("x-api-key", userTwoApiKey);

    // Access should be blocked because the trip belongs to another user
    expect(response.statusCode).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Access denied");
  });
});