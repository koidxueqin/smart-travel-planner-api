const request = require("supertest");
const app = require("../src/app");

// Create a unique test user 
function createTestUser(overrides = {}) {
  const uniqueValue = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;

  return {
    name: overrides.name || "Test User",
    email: overrides.email || `testuser_${uniqueValue}@example.com`,
    password: overrides.password || "Password123",
    ...overrides
  };
}

// Extract a token from the login response
function extractToken(response) {
  return (
    response.body.token ||
    response.body.data?.token ||
    response.body.data?.accessToken
  );
}

async function registerUser(userData = {}) {
  const user = createTestUser(userData);

  const response = await request(app)
    .post("/api/v1/auth/register")
    .send(user);

  return {
    user,
    response
  };
}

async function loginUser(user) {
  const response = await request(app)
    .post("/api/v1/auth/login")
    .send({
      email: user.email,
      password: user.password
    });

  const token = extractToken(response);

  return {
    response,
    token
  };
}

async function registerAndLogin(userData = {}) {
  const { user, response: registerResponse } = await registerUser(userData);
  const { response: loginResponse, token } = await loginUser(user);

  return {
    user,
    token,
    registerResponse,
    loginResponse
  };
}

// Create example valid trip data for tests
function createTestTrip(overrides = {}) {
  return {
    destination: "London",
    country: "United Kingdom",
    startDate: "2026-07-10",
    endDate: "2026-07-15",
    notes: "Automated test trip",
    preferences: "Museums and walking",
    ...overrides
  };
}

module.exports = {
  request,
  app,
  createTestUser,
  registerUser,
  loginUser,
  registerAndLogin,
  createTestTrip
};