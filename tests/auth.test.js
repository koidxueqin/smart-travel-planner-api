const connectDatabase = require("../src/config/database");
const {
  request,
  app,
  createTestUser,
  registerUser,
  loginUser,
  registerAndLogin
} = require("./testUtils");

const { clearDatabase, closeDatabase } = connectDatabase;

// Helper function to support different possible response structures
function getResponseUser(response) {
  return response.body.data?.user || response.body.data;
}

// Clear database before each test so tests do not affect each other
beforeEach(async () => {
  await clearDatabase();
});

// Close database connection after all authentication tests finish
afterAll(async () => {
  await closeDatabase();
});

describe("Authentication API", () => {
  test("Register user successfully", async () => {
    // Create a test user object
    const user = createTestUser();

    // Send registration request
    const response = await request(app)
      .post("/api/v1/auth/register")
      .send(user);

    const responseUser = getResponseUser(response);

    // Check that user registration succeeds and password data is not exposed
    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(responseUser).toBeDefined();
    expect(responseUser.email).toBe(user.email);
    expect(responseUser.password).toBeUndefined();
    expect(responseUser.passwordHash).toBeUndefined();
  });

  test("Prevent duplicate email", async () => {
    const user = createTestUser();

    // Register the user once
    await request(app)
      .post("/api/v1/auth/register")
      .send(user);

    // Try to register again using the same email
    const response = await request(app)
      .post("/api/v1/auth/register")
      .send(user);

    // Duplicate emails should not be allowed
    expect(response.statusCode).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Email already exists");
  });

  test("Login successfully", async () => {
    // Register a user before attempting login
    const { user } = await registerUser();
    const { response, token } = await loginUser(user);

    // Successful login should return a token
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(token).toBeDefined();
  });

  test("Reject wrong password", async () => {
    // Register a valid user
    const { user } = await registerUser();

    // Attempt login with the correct email but wrong password
    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: user.email,
        password: "WrongPassword123"
      });

    // Login should fail when the password is incorrect
    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid email or password");
  });

  test("GET /api/v1/auth/me without token should fail", async () => {
    // Try to access protected user profile route without a token
    const response = await request(app).get("/api/v1/auth/me");

    // Request should be rejected because authentication is required
    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Authentication required");
  });

  test("GET /api/v1/auth/me with token should work", async () => {
    // Register and login to get a valid token
    const { user, token } = await registerAndLogin();

    // Access protected profile route with the token
    const response = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${token}`);

    const responseUser = getResponseUser(response);

    // Authenticated user should be able to view their own profile
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(responseUser.email).toBe(user.email);
  });
});