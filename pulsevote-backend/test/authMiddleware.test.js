const request = require("supertest");
const app = require("../app");

describe("Authentication Middleware", () => {
  it("rejects a request without an Authorization header", async () => {
    const res = await request(app)
      .get("/api/organisations/my-organisations");

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message", "Unauthorized");
  });

  it("rejects an Authorization header without Bearer", async () => {
    const res = await request(app)
      .get("/api/organisations/my-organisations")
      .set("Authorization", "InvalidToken");

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message", "Unauthorized");
  });

  it("rejects an invalid JWT", async () => {
    const res = await request(app)
      .get("/api/organisations/my-organisations")
      .set("Authorization", "Bearer invalid-token");

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty(
      "message",
      "Token invalid or expired"
    );
  });
});