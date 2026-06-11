// Mock the weather service so the tests do not call the real OpenWeatherMap API
jest.mock("../src/services/weatherService", () => ({
  getWeatherByCity: jest.fn()
}));

const {
  request,
  app,
  registerAndLogin,
  createTestTrip
} = require("./testUtils");

// Import the mocked weather service so we can control its fake response
const weatherService = require("../src/services/weatherService");

// Import database helper functions for test cleanup
const {
  clearDatabase,
  closeDatabase
} = require("../src/config/database");

// Helper function to create a trip during tests
async function createTrip(token, tripData = {}) {
  const response = await request(app)
    .post("/api/v1/trips")
    .set("Authorization", `Bearer ${token}`)
    .send(createTestTrip(tripData));

  return response;
}

// Helper function to generate an API key during tests
async function generateApiKey(token) {
  const response = await request(app)
    .post("/api/v1/api-keys")
    .set("Authorization", `Bearer ${token}`);

  return response;
}

describe("Trip Plan API", () => {
  beforeEach(async () => {
    // Clear previous mock calls before each test
    jest.clearAllMocks();

    // Reset the database so each test starts with clean data
    await clearDatabase();

    // Provide fake weather data for trip plan generation
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
    // Close the database connection after all tests finish
    await closeDatabase();
  });

  test("POST /api/v1/api-keys should generate an API key with expiry date", async () => {
    // Register and log in a test user
    const { token } = await registerAndLogin();

    // Generate an API key for the logged-in user
    const response = await generateApiKey(token);

    // Check that the API key was created successfully
    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);

    // Check that the response includes the plain API key and expiry date
    expect(response.body.data.apiKey).toBeDefined();
    expect(response.body.data.expiresAt).toBeDefined();

    // Check that the generated API key has the expected short format
    expect(response.body.data.apiKey.length).toBeGreaterThanOrEqual(5);
    expect(response.body.data.apiKey.length).toBeLessThanOrEqual(10);
  });

  test("GET /api/v1/api-keys should return API key records without exposing plain key", async () => {
    // Register and log in a test user
    const { token } = await registerAndLogin();

    // Generate an API key first
    await generateApiKey(token);

    // Request the user's API key records
    const response = await request(app)
      .get("/api/v1/api-keys")
      .set("Authorization", `Bearer ${token}`);

    // Check successful response
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);

    // Check that API key records are returned as an array
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);

    // Expiry date should be visible
    expect(response.body.data[0].expiresAt).toBeDefined();

    // Plain API key should not be exposed when listing saved key records
    expect(response.body.data[0].apiKey).toBeUndefined();
  });

  test("GET /api/v1/trip-plan/:tripId should return complete trip plan with valid API key", async () => {
    // Register and log in a test user
    const { token } = await registerAndLogin();

    // Create a trip for the user
    const tripResponse = await createTrip(token);

    // Generate an API key for the same user
    const apiKeyResponse = await generateApiKey(token);

    const tripId = tripResponse.body.data.id;
    const apiKey = apiKeyResponse.body.data.apiKey;

    // Request the complete trip plan using the valid API key
    const response = await request(app)
      .get(`/api/v1/trip-plan/${tripId}`)
      .set("x-api-key", apiKey);

    // Check successful response
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Trip plan generated successfully");

    // Check that the trip plan combines all required sections
    expect(response.body.data.trip).toBeDefined();
    expect(response.body.data.weather).toBeDefined();
    expect(response.body.data.travelSummary).toBeDefined();
    expect(response.body.data.packingChecklist).toBeDefined();

    // Packing checklist should be returned as an array
    expect(Array.isArray(response.body.data.packingChecklist)).toBe(true);

    // Check trip and weather values from the created trip and mocked weather service
    expect(response.body.data.trip.destination).toBe("London");
    expect(response.body.data.weather.description).toBe("light rain");
  });

  test("GET /api/v1/trip-plan/:tripId should fail without API key", async () => {
    // Register and log in a test user
    const { token } = await registerAndLogin();

    // Create a trip
    const tripResponse = await createTrip(token);
    const tripId = tripResponse.body.data.id;

    // Request trip plan without x-api-key
    const response = await request(app)
      .get(`/api/v1/trip-plan/${tripId}`);

    // Request should fail because API key is required
    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("API key is required");
  });

  test("GET /api/v1/trip-plan/:tripId should fail with wrong API key", async () => {
    // Register and log in a test user
    const { token } = await registerAndLogin();

    // Create a trip
    const tripResponse = await createTrip(token);
    const tripId = tripResponse.body.data.id;

    // Request trip plan using an invalid API key
    const response = await request(app)
      .get(`/api/v1/trip-plan/${tripId}`)
      .set("x-api-key", "wrong123");

    // Request should fail because the API key is invalid
    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid API key");
  });

  test("GET /api/v1/trip-plan/:tripId should fail with invalid trip ID", async () => {
    // Register and log in a test user
    const { token } = await registerAndLogin();

    // Generate a valid API key
    const apiKeyResponse = await generateApiKey(token);
    const apiKey = apiKeyResponse.body.data.apiKey;

    // Use an invalid non-number trip ID
    const response = await request(app)
      .get("/api/v1/trip-plan/abc")
      .set("x-api-key", apiKey);

    // Request should fail because trip ID must be numeric
    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Trip ID must be a positive number");
  });

  test("GET /api/v1/trip-plan/:tripId should fail when trip does not exist", async () => {
    // Register and log in a test user
    const { token } = await registerAndLogin();

    // Generate a valid API key
    const apiKeyResponse = await generateApiKey(token);
    const apiKey = apiKeyResponse.body.data.apiKey;

    // Use a valid number ID that does not exist in the database
    const response = await request(app)
      .get("/api/v1/trip-plan/9999")
      .set("x-api-key", apiKey);

    // Request should fail because the trip cannot be found
    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Trip not found");
  });

  test("GET /api/v1/trip-plan/:tripId should prevent access to another user's trip", async () => {
    // Create two separate users
    const userOne = await registerAndLogin();
    const userTwo = await registerAndLogin();

    // User one creates a trip
    const tripResponse = await createTrip(userOne.token);
    const tripId = tripResponse.body.data.id;

    // User two generates their own API key
    const apiKeyResponse = await generateApiKey(userTwo.token);
    const userTwoApiKey = apiKeyResponse.body.data.apiKey;

    // User two tries to access user one's trip plan
    const response = await request(app)
      .get(`/api/v1/trip-plan/${tripId}`)
      .set("x-api-key", userTwoApiKey);

    // Access should be blocked because the trip belongs to another user
    expect(response.statusCode).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Access denied");
  });

  test("POST /api/v1/api-keys without JWT should fail", async () => {
    // Try to generate an API key without logging in
    const response = await request(app).post("/api/v1/api-keys");

    // Request should fail because JWT authentication is required
    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Authentication required");
  });

  test("GET /api/v1/api-keys without JWT should fail", async () => {
    // Try to view API key records without logging in
    const response = await request(app).get("/api/v1/api-keys");

    // Request should fail because JWT authentication is required
    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Authentication required");
  });
});