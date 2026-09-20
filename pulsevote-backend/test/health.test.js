const request = require("supertest");
const app = require("../app");

describe("GET /health", () => {
  it("returns 200 when the API is healthy", async () => {
    const response = await request(app).get("/health");

    expect(response.statusCode).toBe(200);
  });
});
