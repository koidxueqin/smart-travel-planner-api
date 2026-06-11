const connectDatabase = require("../src/config/database");
const {
  request,
  app,
  registerAndLogin,
  createTestTrip
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

describe("Trips API", () => {
  test("Protected trip routes without token should fail", async () => {
    const response = await request(app).get("/api/v1/trips");

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Authentication required");
  });

  test("Create trip with valid token", async () => {
    const trip = createTestTrip();

    const response = await request(app)
      .post("/api/v1/trips")
      .set("Authorization", `Bearer ${token}`)
      .send(trip);

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.destination).toBe(trip.destination);
    expect(response.body.data.userId).toBeDefined();
  });

  test("Get trips with valid token", async () => {
    const trip = createTestTrip();

    await request(app)
      .post("/api/v1/trips")
      .set("Authorization", `Bearer ${token}`)
      .send(trip);

    const response = await request(app)
      .get("/api/v1/trips")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.count).toBeGreaterThanOrEqual(1);
  });

  test("Get one trip with valid token", async () => {
    const trip = createTestTrip();

    const createResponse = await request(app)
      .post("/api/v1/trips")
      .set("Authorization", `Bearer ${token}`)
      .send(trip);

    const tripId = createResponse.body.data.id;

    const response = await request(app)
      .get(`/api/v1/trips/${tripId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(tripId);
    expect(response.body.data.destination).toBe(trip.destination);
  });

  test("Update trip with valid token", async () => {
    const trip = createTestTrip();

    const createResponse = await request(app)
      .post("/api/v1/trips")
      .set("Authorization", `Bearer ${token}`)
      .send(trip);

    const tripId = createResponse.body.data.id;

    const updatedTrip = createTestTrip({
      destination: "Paris",
      country: "France",
      startDate: "2026-08-01",
      endDate: "2026-08-05",
      notes: "Updated trip notes",
      preferences: "Food and museums"
    });

    const response = await request(app)
      .put(`/api/v1/trips/${tripId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updatedTrip);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.destination).toBe("Paris");
    expect(response.body.data.country).toBe("France");
  });

  test("Delete trip with valid token", async () => {
    const trip = createTestTrip();

    const createResponse = await request(app)
      .post("/api/v1/trips")
      .set("Authorization", `Bearer ${token}`)
      .send(trip);

    const tripId = createResponse.body.data.id;

    const deleteResponse = await request(app)
      .delete(`/api/v1/trips/${tripId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(deleteResponse.statusCode).toBe(200);
    expect(deleteResponse.body.success).toBe(true);

    const getResponse = await request(app)
      .get(`/api/v1/trips/${tripId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(getResponse.statusCode).toBe(404);
    expect(getResponse.body.success).toBe(false);
  });

  test("Missing destination should fail", async () => {
    const response = await request(app)
      .post("/api/v1/trips")
      .set("Authorization", `Bearer ${token}`)
      .send({
        country: "United Kingdom",
        startDate: "2026-07-10",
        endDate: "2026-07-15"
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validation failed");
  });

  test("Invalid date should fail", async () => {
    const response = await request(app)
      .post("/api/v1/trips")
      .set("Authorization", `Bearer ${token}`)
      .send(
        createTestTrip({
          startDate: "2026-99-99"
        })
      );

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validation failed");
  });

  test("End date earlier than start date should fail", async () => {
    const response = await request(app)
      .post("/api/v1/trips")
      .set("Authorization", `Bearer ${token}`)
      .send(
        createTestTrip({
          startDate: "2026-07-20",
          endDate: "2026-07-10"
        })
      );

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validation failed");
  });

  test("User cannot access another user's trip", async () => {
    const firstUser = await registerAndLogin();
    const secondUser = await registerAndLogin();

    const createResponse = await request(app)
      .post("/api/v1/trips")
      .set("Authorization", `Bearer ${firstUser.token}`)
      .send(createTestTrip());

    const tripId = createResponse.body.data.id;

    const response = await request(app)
      .get(`/api/v1/trips/${tripId}`)
      .set("Authorization", `Bearer ${secondUser.token}`);

    expect(response.statusCode).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Access denied");
  });
});