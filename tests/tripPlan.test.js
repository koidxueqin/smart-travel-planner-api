jest.mock("../src/services/weatherService", () => ({
  getWeatherByCity: jest.fn()
}));

const {
  request,
  app,
  registerAndLogin,
  createTestTrip
} = require("./testUtils");

const weatherService = require("../src/services/weatherService");
const {
  clearDatabase,
  closeDatabase
} = require("../src/config/database");

async function createTrip(token, tripData = {}) {
  const response = await request(app)
    .post("/api/v1/trips")
    .set("Authorization", `Bearer ${token}`)
    .send(createTestTrip(tripData));

  return response;
}

async function generateApiKey(token) {
  const response = await request(app)
    .post("/api/v1/api-keys")
    .set("Authorization", `Bearer ${token}`);

  return response;
}

describe("Trip Plan API", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await clearDatabase();

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
    await closeDatabase();
  });

  test("POST /api/v1/api-keys should generate an API key with expiry date", async () => {
    const { token } = await registerAndLogin();

    const response = await generateApiKey(token);

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.apiKey).toBeDefined();
    expect(response.body.data.expiresAt).toBeDefined();
    expect(response.body.data.apiKey.length).toBeGreaterThanOrEqual(5);
    expect(response.body.data.apiKey.length).toBeLessThanOrEqual(10);
  });

  test("GET /api/v1/api-keys should return API key records without exposing plain key", async () => {
    const { token } = await registerAndLogin();

    await generateApiKey(token);

    const response = await request(app)
      .get("/api/v1/api-keys")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data[0].expiresAt).toBeDefined();
    expect(response.body.data[0].apiKey).toBeUndefined();
  });

  test("GET /api/v1/trip-plan/:tripId should return complete trip plan with valid API key", async () => {
    const { token } = await registerAndLogin();

    const tripResponse = await createTrip(token);
    const apiKeyResponse = await generateApiKey(token);

    const tripId = tripResponse.body.data.id;
    const apiKey = apiKeyResponse.body.data.apiKey;

    const response = await request(app)
      .get(`/api/v1/trip-plan/${tripId}`)
      .set("x-api-key", apiKey);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Trip plan generated successfully");

    expect(response.body.data.trip).toBeDefined();
    expect(response.body.data.weather).toBeDefined();
    expect(response.body.data.travelSummary).toBeDefined();
    expect(response.body.data.packingChecklist).toBeDefined();

    expect(Array.isArray(response.body.data.packingChecklist)).toBe(true);
    expect(response.body.data.trip.destination).toBe("London");
    expect(response.body.data.weather.description).toBe("light rain");
  });

  test("GET /api/v1/trip-plan/:tripId should fail without API key", async () => {
    const { token } = await registerAndLogin();

    const tripResponse = await createTrip(token);
    const tripId = tripResponse.body.data.id;

    const response = await request(app)
      .get(`/api/v1/trip-plan/${tripId}`);

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("API key is required");
  });

  test("GET /api/v1/trip-plan/:tripId should fail with wrong API key", async () => {
    const { token } = await registerAndLogin();

    const tripResponse = await createTrip(token);
    const tripId = tripResponse.body.data.id;

    const response = await request(app)
      .get(`/api/v1/trip-plan/${tripId}`)
      .set("x-api-key", "wrong123");

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid API key");
  });

  test("GET /api/v1/trip-plan/:tripId should fail with invalid trip ID", async () => {
    const { token } = await registerAndLogin();

    const apiKeyResponse = await generateApiKey(token);
    const apiKey = apiKeyResponse.body.data.apiKey;

    const response = await request(app)
      .get("/api/v1/trip-plan/abc")
      .set("x-api-key", apiKey);

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Trip ID must be a positive number");
  });

  test("GET /api/v1/trip-plan/:tripId should fail when trip does not exist", async () => {
    const { token } = await registerAndLogin();

    const apiKeyResponse = await generateApiKey(token);
    const apiKey = apiKeyResponse.body.data.apiKey;

    const response = await request(app)
      .get("/api/v1/trip-plan/9999")
      .set("x-api-key", apiKey);

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Trip not found");
  });

  test("GET /api/v1/trip-plan/:tripId should prevent access to another user's trip", async () => {
    const userOne = await registerAndLogin();
    const userTwo = await registerAndLogin();

    const tripResponse = await createTrip(userOne.token);
    const tripId = tripResponse.body.data.id;

    const apiKeyResponse = await generateApiKey(userTwo.token);
    const userTwoApiKey = apiKeyResponse.body.data.apiKey;

    const response = await request(app)
      .get(`/api/v1/trip-plan/${tripId}`)
      .set("x-api-key", userTwoApiKey);

    expect(response.statusCode).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Access denied");
  });
});