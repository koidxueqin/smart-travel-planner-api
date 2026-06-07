const connectDatabase = require("../src/config/database");
const {
  request,
  app,
  registerAndLogin,
  createTestTrip
} = require("./testUtils");

const { clearDatabase, closeDatabase } = connectDatabase;

// Helper function used only in tests to change a registered user into an admin
async function promoteUserToAdmin(email) {
  const db = await connectDatabase();

  await db.run(
    `
    UPDATE users
    SET role = 'admin'
    WHERE email = ?
    `,
    [email]
  );
}

// Clear test data before each test so every test starts with a clean database
beforeEach(async () => {
  await clearDatabase();
});

// Close database connection after all tests finish
afterAll(async () => {
  await closeDatabase();
});

describe("Admin API", () => {
  test("Normal user cannot access admin trips route", async () => {
    // Register and login as a normal user
    const { token } = await registerAndLogin();

    // Try to access the admin-only route using a normal user token
    const response = await request(app)
      .get("/api/v1/admin/trips")
      .set("Authorization", `Bearer ${token}`);

    // Normal users should be blocked from admin routes
    expect(response.statusCode).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Access denied");
  });

  test("Admin user can access all trips", async () => {
    // Create one normal user and one user that will be promoted to admin
    const normalUser = await registerAndLogin();
    const adminUser = await registerAndLogin();

    // Promote the second user to admin for this test
    await promoteUserToAdmin(adminUser.user.email);

    // Create a trip as the normal user
    await request(app)
      .post("/api/v1/trips")
      .set("Authorization", `Bearer ${normalUser.token}`)
      .send(createTestTrip());

    // Access all trips using the admin user's token
    const response = await request(app)
      .get("/api/v1/admin/trips")
      .set("Authorization", `Bearer ${adminUser.token}`);

    // Admin should be able to view trips from all users
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.count).toBeGreaterThanOrEqual(1);
  });
});