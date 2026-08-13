const request = require("supertest");
const app = require("../app");

describe("Authentication API", () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = "StrongPassword123!";

  describe("POST /api/auth/register-user", () => {
    it("rejects an invalid email", async () => {
      const res = await request(app)
        .post("/api/auth/register-user")
        .send({
          email: "not-an-email",
          password: testPassword
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message");
    });

    it("rejects an empty password", async () => {
      const res = await request(app)
        .post("/api/auth/register-user")
        .send({
          email: `empty-${Date.now()}@example.com`,
          password: ""
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message");
    });

    it("registers a new user", async () => {
      const res = await request(app)
        .post("/api/auth/register-user")
        .send({
          email: testEmail,
          password: testPassword
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("message", "User registered");
      expect(res.body).toHaveProperty("token");
    });

    it("rejects a duplicate email", async () => {
      const res = await request(app)
        .post("/api/auth/register-user")
        .send({
          email: testEmail,
          password: testPassword
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message", "Email already exists");
    });
  });

  describe("POST /api/auth/login", () => {
    it("rejects an invalid email", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "invalid-email",
          password: testPassword
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message");
    });

    it("rejects an empty password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: `login-${Date.now()}@example.com`,
          password: ""
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message");
    });

    it("logs in with valid credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: testEmail,
          password: testPassword
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("token");
    });

    it("rejects incorrect password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: testEmail,
          password: "WrongPassword123!"
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message", "Invalid credentials");
    });
  });
});