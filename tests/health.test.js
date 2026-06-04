const { request, app } = require("./testUtils");

describe("Health check", () => {
  test("GET /health should return 200 and success true", async () => {
    const response = await request(app).get("/health");

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.status).toBe("OK");
  });
});