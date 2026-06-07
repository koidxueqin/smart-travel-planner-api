// Mock the weather service so tests do not call the real OpenWeatherMap API
jest.mock("../src/services/weatherService", () => ({
  getWeatherByCity: jest.fn()
}));

const { request, app } = require("./testUtils");
const weatherService = require("../src/services/weatherService");

describe("Weather API", () => {
  beforeEach(() => {
    // Clear mock history before each test
    jest.clearAllMocks();
  });

  test("GET /api/v1/weather should return mocked weather data", async () => {
    // Set the fake weather data returned by the mocked service
    weatherService.getWeatherByCity.mockResolvedValue({
      city: "London",
      country: "GB",
      temperature: 18,
      feelsLike: 17,
      description: "clear sky",
      humidity: 60,
      windSpeed: 4
    });

    // Request weather data for London
    const response = await request(app).get("/api/v1/weather?city=London");

    // API should return the mocked weather data successfully
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.city).toBe("London");
    expect(response.body.data.temperature).toBe(18);
  });

  test("GET /api/v1/weather without city should fail", async () => {
    // Send request without the required city query parameter
    const response = await request(app).get("/api/v1/weather");

    // Request should fail because city is required
    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("City is required");
  });
});