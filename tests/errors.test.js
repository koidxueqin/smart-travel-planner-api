const connectDatabase = require("../src/config/database");
const {
  request,
  app,
  registerAndLogin
} = require("./testUtils");

const { clearDatabase, closeDatabase } = connectDatabase;

let token;

beforeEach(async () => {
  await clearDatabase();

  const loginData = await registerAndLogin();
  token = loginData.token;
});

afterAll(async () => {
  await closeDatabase();
});

describe("Error handling", () => {
  test("Wrong route should return clean JSON", async () => {
    const response = await request(app).get("/api/v1/route-that-does-not-exist");

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBeDefined();
  });

  test("Invalid trip ID should return clean JSON", async () => {
    const response = await request(app)
      .get("/api/v1/trips/abc")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Trip ID must be a positive number");
  });
});