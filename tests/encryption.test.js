const connectDatabase = require("../src/config/database");
const {
  request,
  app,
  registerAndLogin,
  createTestTrip
} = require("./testUtils");

const { clearDatabase, closeDatabase } = connectDatabase;

describe("Trip Data Encryption", () => {
  beforeEach(async () => {
    // Reset database before each test
    await clearDatabase();
  });

  afterAll(async () => {
    // Close database connection after all encryption tests finish
    await closeDatabase();
  });

  test("Trip notes and preferences should be encrypted in database but decrypted in API response", async () => {
    // Register and log in a test user
    const { token } = await registerAndLogin();

    // These are the original plain text values sent through the API
    const originalNotes = "Private note for automated encryption test";
    const originalPreferences = "Quiet hotels and museums";

    // Create a trip with notes and preferences
    const createResponse = await request(app)
      .post("/api/v1/trips")
      .set("Authorization", `Bearer ${token}`)
      .send(
        createTestTrip({
          notes: originalNotes,
          preferences: originalPreferences
        })
      );

    // Check trip creation succeeded
    expect(createResponse.statusCode).toBe(201);
    expect(createResponse.body.success).toBe(true);

    const tripId = createResponse.body.data.id;

    // API response should show decrypted readable values to the user
    expect(createResponse.body.data.notes).toBe(originalNotes);
    expect(createResponse.body.data.preferences).toBe(originalPreferences);

    // Directly read the raw database record
    const db = await connectDatabase();

    const rawTrip = await db.get(
      "SELECT notes, preferences FROM trips WHERE id = ?",
      [tripId]
    );

    expect(rawTrip).toBeDefined();

    // Raw database values should not match the original plain text
    expect(rawTrip.notes).not.toBe(originalNotes);
    expect(rawTrip.preferences).not.toBe(originalPreferences);

    // Encrypted values should contain the IV and encrypted data separator
    expect(rawTrip.notes).toContain(":");
    expect(rawTrip.preferences).toContain(":");

    // Get the trip again through the API
    const getResponse = await request(app)
      .get(`/api/v1/trips/${tripId}`)
      .set("Authorization", `Bearer ${token}`);

    // API should decrypt the data before returning it
    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.body.success).toBe(true);
    expect(getResponse.body.data.notes).toBe(originalNotes);
    expect(getResponse.body.data.preferences).toBe(originalPreferences);
  });
});