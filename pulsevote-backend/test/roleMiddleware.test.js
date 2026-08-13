const request = require("supertest");
const app = require("../app");

describe("Role Middleware", () => {
  it("rejects unauthenticated access to admin routes", async () => {
    const res = await request(app)
      .post("/api/auth/register-manager")
      .send({
        email: "manager-test@example.com",
        password: "StrongPassword123!"
      });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message", "Unauthorized");
  });

  it("rejects unauthenticated access to organisation creation", async () => {
    const res = await request(app)
      .post("/api/organisations/create-organisation")
      .send({
        name: "Test Organisation"
      });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message", "Unauthorized");
  });

  it("rejects unauthenticated access to poll creation", async () => {
    const res = await request(app)
      .post("/api/polls/create-poll")
      .send({
        organisationId: "000000000000000000000000",
        question: "Test question?",
        options: ["Yes", "No"]
      });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message", "Unauthorized");
  });
});