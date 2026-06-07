const connectDatabase = require("../src/config/database");
const {
  request,
  app,
  registerAndLogin
} = require("./testUtils");

const { clearDatabase, closeDatabase } = connectDatabase;

let token;

// Clear database and create a fresh authenticated user before each test
beforeEach(async () => {
  await clearDatabase();

  const loginData = await registerAndLogin();
  token = loginData.token;
});

// Close database connection after all error handling tests finish
afterAll(async () => {
  await closeDatabase();
});

describe("Error handling", () => {
  test("Wrong route should return clean JSON", async () => {
    // Request a route that does not exist
    const response = await request(app).get("/api/v1/route-that-does-not-exist");

    // The API should return a clear JSON 404 response
    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBeDefined();
  });

  test("Invalid trip ID should return clean JSON", async () => {
    // Send an invalid trip ID while using a valid token
    const response = await request(app)
      .get("/api/v1/trips/abc")
      .set("Authorization", `Bearer ${token}`);

    // Invalid IDs should be handled safely with a clear error response
    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Trip ID must be a positive number");
  });
});