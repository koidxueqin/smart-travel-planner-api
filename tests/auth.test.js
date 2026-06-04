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

function getResponseUser(response) {
  return response.body.data?.user || response.body.data;
}

beforeEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

describe("Authentication API", () => {
  test("Register user successfully", async () => {
    const user = createTestUser();

    const response = await request(app)
        .post("/api/v1/auth/register")
        .send(user);

    const responseUser = getResponseUser(response);

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(responseUser).toBeDefined();
    expect(responseUser.email).toBe(user.email);
    expect(responseUser.password).toBeUndefined();
    expect(responseUser.passwordHash).toBeUndefined();
  });

  test("Prevent duplicate email", async () => {
    const user = createTestUser();

    await request(app)
      .post("/api/v1/auth/register")
      .send(user);

    const response = await request(app)
      .post("/api/v1/auth/register")
      .send(user);

    expect(response.statusCode).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Email already exists");
  });

  test("Login successfully", async () => {
    const { user } = await registerUser();
    const { response, token } = await loginUser(user);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(token).toBeDefined();
  });

  test("Reject wrong password", async () => {
    const { user } = await registerUser();

    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: user.email,
        password: "WrongPassword123"
      });

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid email or password");
  });

  test("GET /api/v1/auth/me without token should fail", async () => {
    const response = await request(app).get("/api/v1/auth/me");

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Authentication required");
  });

  test("GET /api/v1/auth/me with token should work", async () => {
    const { user, token } = await registerAndLogin();

    const response = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${token}`);

    const responseUser = getResponseUser(response);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(responseUser.email).toBe(user.email);
  });
});