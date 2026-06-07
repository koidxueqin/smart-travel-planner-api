const expectCookies = require("supertest/lib/cookies");
const connectDatabase = require("../src/config/database");
const {
  request,
  app,
  registerAndLogin,
  createTestTrip
} = require("./testUtils");

const { clearDatabase, closeDatabase } = connectDatabase;

let token;

// Clear database and create a fresh logged-in user before each test
beforeEach(async () => {
  await clearDatabase();

  const loginData = await registerAndLogin();
  token = loginData.token;
});

// Close database connection after all trip tests finish
afterAll(async () => {
  await closeDatabase();
});

describe("Trips API", () => {
  test("Protected trip routes without token should fail", async () => {
    // Try to access protected trip route without authentication
    const response = await request(app).get("/api/v1/trips");

    // Request should fail because no token is provided
    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Authentication required");
  });

  test("Create trip with valid token", async () => {
    const trip = createTestTrip();

    // Create a new trip using a valid user token
    const response = await request(app)
      .post("/api/v1/trips")
      .set("Authorization", `Bearer ${token}`)
      .send(trip);

    // Trip should be created and linked to the logged-in user
    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.destination).toBe(trip.destination);
    expect(response.body.data.userId).toBeDefined();
  });

  test("Get trips with valid token", async () => {
    const trip = createTestTrip();

    // Create a trip first so there is data to retrieve
    await request(app)
      .post("/api/v1/trips")
      .set("Authorization", `Bearer ${token}`)
      .send(trip);

    // Retrieve trips for the logged-in user
    const response = await request(app)
      .get("/api/v1/trips")
      .set("Authorization", `Bearer ${token}`);

    // Response should return an array of trips
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.count).toBeGreaterThanOrEqual(1);
  });

  test("Get one trip with valid token", async () => {
    const trip = createTestTrip();

    // Create a trip and store its ID
    const createResponse = await request(app)
      .post("/api/v1/trips")
      .set("Authorization", `Bearer ${token}`)
      .send(trip);

    const tripId = createResponse.body.data.id;

    // Retrieve the created trip by ID
    const response = await request(app)
      .get(`/api/v1/trips/${tripId}`)
      .set("Authorization", `Bearer ${token}`);

    // Returned trip should match the created trip
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(tripId);
    expect(response.body.data.destination).toBe(trip.destination);
  });

  test("Update trip with valid token", async () => {
    const trip = createTestTrip();

    // Create a trip before updating it
    const createResponse = await request(app)
      .post("/api/v1/trips")
      .set("Authorization", `Bearer ${token}`)
      .send(trip);

    const tripId = createResponse.body.data.id;

    // Prepare updated trip data
    const updatedTrip = createTestTrip({
      destination: "Paris",
      country: "France",
      startDate: "2026-08-01",
      endDate: "2026-08-05",
      notes: "Updated trip notes",
      preferences: "Food and museums"
    });

    // Update the existing trip
    const response = await request(app)
      .put(`/api/v1/trips/${tripId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updatedTrip);

    // Updated data should be returned in the response
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.destination).toBe("Paris");
    expect(response.body.data.country).toBe("France");
  });

  test("Delete trip with valid token", async () => {
    const trip = createTestTrip();

    // Create a trip before deleting it
    const createResponse = await request(app)
      .post("/api/v1/trips")
      .set("Authorization", `Bearer ${token}`)
      .send(trip);

    const tripId = createResponse.body.data.id;

    // Delete the created trip
    const deleteResponse = await request(app)
      .delete(`/api/v1/trips/${tripId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(deleteResponse.statusCode).toBe(200);
    expect(deleteResponse.body.success).toBe(true);

    // Try to retrieve the deleted trip
    const getResponse = await request(app)
      .get(`/api/v1/trips/${tripId}`)
      .set("Authorization", `Bearer ${token}`);

    // Deleted trip should no longer be found
    expect(getResponse.statusCode).toBe(404);
    expect(getResponse.body.success).toBe(false);
  });

  test("Missing destination should fail", async () => {
    // Send trip data without the required destination field
    const response = await request(app)
      .post("/api/v1/trips")
      .set("Authorization", `Bearer ${token}`)
      .send({
        country: "United Kingdom",
        startDate: "2026-07-10",
        endDate: "2026-07-15"
      });

    // Validation should reject the incomplete request
    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validation failed");
  });

  test("Invalid date should fail", async () => {
    // Send a trip with an invalid date format
    const response = await request(app)
      .post("/api/v1/trips")
      .set("Authorization", `Bearer ${token}`)
      .send(
        createTestTrip({
          startDate: "2026-99-99"
        })
      );

    // Validation should reject invalid dates
    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validation failed");
  });

  test("End date earlier than start date should fail", async () => {
    // Send a trip where the end date is before the start date
    const response = await request(app)
      .post("/api/v1/trips")
      .set("Authorization", `Bearer ${token}`)
      .send(
        createTestTrip({
          startDate: "2026-07-20",
          endDate: "2026-07-10"
        })
      );

    // Validation should reject invalid date ranges
    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validation failed");
  });

  test("User cannot access another user's trip", async () => {
    // Create two separate users
    const firstUser = await registerAndLogin();
    const secondUser = await registerAndLogin();

    // First user creates a trip
    const createResponse = await request(app)
      .post("/api/v1/trips")
      .set("Authorization", `Bearer ${firstUser.token}`)
      .send(createTestTrip());

    const tripId = createResponse.body.data.id;

    // Second user tries to access the first user's trip
    const response = await request(app)
      .get(`/api/v1/trips/${tripId}`)
      .set("Authorization", `Bearer ${secondUser.token}`);

    // Users should not be allowed to access trips they do not own
    expect(response.statusCode).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Access denied");
  });
});