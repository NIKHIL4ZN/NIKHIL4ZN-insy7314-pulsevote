const { rateLimit, ipKeyGenerator } = require("express-rate-limit");

const keyByIp = (req) => {
  return ipKeyGenerator(
    req.ip ||
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.connection?.remoteAddress ||
    "unknown"
  );
};

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: keyByIp,

  handler: (req, res) => {
    return res.status(429).json({
      message: "Too many registration attempts. Please try again later."
    });
  }
});

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,

  keyGenerator: (req) => {
    const email = req.body?.email || "";

    return `${keyByIp(req)}:${email}`;
  },

  handler: (req, res) => {
    return res.status(429).json({
      message: "Too many login attempts. Please try again later."
    });
  }
});

module.exports = {
  registerLimiter,
  loginLimiter
};