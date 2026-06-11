// Mock the weather service so the test does not call the real OpenWeatherMap API
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

// Helper function to create a trip during tests
async function createTrip(token, tripData = {}) {
  const response = await request(app)
    .post("/api/v1/trips")
    .set("Authorization", `Bearer ${token}`)
    .send(createTestTrip(tripData));

  return response;
}

describe("Trip Weather Summary API", () => {
  beforeEach(async () => {
    // Clear mock history before each test
    jest.clearAllMocks();

    // Reset database so every test starts with clean data
    await clearDatabase();

    // Fake weather response returned by the mocked weather service
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

  test("GET /api/v1/trips/:id/weather should return trip, weather, and travel summary", async () => {
    // Register and log in a test user
    const { token } = await registerAndLogin();

    // Create a trip owned by the logged-in user
    const tripResponse = await createTrip(token);
    const tripId = tripResponse.body.data.id;

    // Request the trip weather summary
    const response = await request(app)
      .get(`/api/v1/trips/${tripId}/weather`)
      .set("Authorization", `Bearer ${token}`);

    // Check successful response
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Trip with weather fetched successfully");

    // Check that the response combines trip data, weather data, and travel advice
    expect(response.body.data.trip).toBeDefined();
    expect(response.body.data.weather).toBeDefined();
    expect(response.body.data.travelSummary).toBeDefined();

    // Check trip data
    expect(response.body.data.trip.id).toBe(tripId);
    expect(response.body.data.trip.destination).toBe("London");

    // Check mocked weather data
    expect(response.body.data.weather.city).toBe("London");
    expect(response.body.data.weather.description).toBe("light rain");

    // Check travel summary fields
    expect(response.body.data.travelSummary.temperatureCategory).toBeDefined();
    expect(response.body.data.travelSummary.weatherCondition).toBeDefined();
    expect(response.body.data.travelSummary.suggestion).toBeDefined();

    // Make sure the weather service was called using the trip destination
    expect(weatherService.getWeatherByCity).toHaveBeenCalledWith("London");
  });

  test("GET /api/v1/trips/:id/weather without token should fail", async () => {
    // Protected route should fail if no JWT token is provided
    const response = await request(app).get("/api/v1/trips/1/weather");

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Authentication required");
  });

  test("GET /api/v1/trips/:id/weather with invalid trip ID should fail", async () => {
    const { token } = await registerAndLogin();

    // Use an invalid non-number trip ID
    const response = await request(app)
      .get("/api/v1/trips/abc/weather")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Trip ID must be a positive number");
  });

  test("GET /api/v1/trips/:id/weather should fail when trip does not exist", async () => {
    const { token } = await registerAndLogin();

    // Use a valid number ID that does not exist in the database
    const response = await request(app)
      .get("/api/v1/trips/9999/weather")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Trip not found");
  });

  test("GET /api/v1/trips/:id/weather should block another user's trip", async () => {
    // Create two separate users
    const userOne = await registerAndLogin();
    const userTwo = await registerAndLogin();

    // First user creates a trip
    const tripResponse = await createTrip(userOne.token);
    const tripId = tripResponse.body.data.id;

    // Second user tries to access the first user's trip weather summary
    const response = await request(app)
      .get(`/api/v1/trips/${tripId}/weather`)
      .set("Authorization", `Bearer ${userTwo.token}`);

    // Access should be blocked because the trip belongs to another user
    expect(response.statusCode).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Access denied");
  });
});