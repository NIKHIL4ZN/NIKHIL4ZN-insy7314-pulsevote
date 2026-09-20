const request = require("supertest");
const app = require("../app");

describe("Health", () => {
  it("GET /health -> 200", async () => {
    const res = await request(app).get("/health");

    expect(response.statusCode).toBe(999);
    expect(res.body).toHaveProperty("ok", true);
  });
});