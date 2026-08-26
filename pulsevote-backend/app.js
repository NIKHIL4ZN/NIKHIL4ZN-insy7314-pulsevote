const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");

const authRoutes = require("./routes/authRoutes");
const organisationRoutes = require("./routes/organisationRoutes");
const pollRoutes = require("./routes/pollRoutes");
const { protect } = require("./middleware/authMiddleware");

dotenv.config();

const app = express();

app.use(helmet());

const CSP_CONNECT = (process.env.CSP_CONNECT || "")
  .split(",")
  .filter(Boolean);

const defaultConnect = [
  "'self'",
  "http://localhost:5000",
  "https://localhost:5000",
  "http://localhost:5173",
  "https://localhost:5173",
  "ws://localhost:5173",
  "wss://localhost:5173"
];

app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://apis.google.com"],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com"
      ],
      imgSrc: [
        "'self'",
        "data:"
      ],
      connectSrc: CSP_CONNECT.length
        ? CSP_CONNECT
        : defaultConnect
    }
  })
);

const allowed = (
  process.env.CORS_ORIGINS ||
  "http://localhost:5173,https://localhost:5173"
)
  .split(",")
  .map((s) => s.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);

      if (allowed.includes(origin)) {
        return cb(null, true);
      }

      cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true
  })
);

app.use(express.json());

app.set("trust proxy", 1);

app.use("/api/auth", authRoutes);
app.use("/api/organisations", organisationRoutes);
app.use("/api/polls", pollRoutes);

app.get("/health", (req, res) =>
  res.status(200).json({
    ok: true,
    ts: Date.now()
  })
);

app.get("/", (req, res) =>
  res.send("PulseVote API running!")
);

app.get("/test", (req, res) => {
  res.json({
    message: "This is a test endpoint from PulseVote API!",
    status: "success",
    timestamp: new Date()
  });
});

app.get("/api/protected", protect, (req, res) => {
  res.json({
    message: `Welcome, user ${req.user.id}! You have accessed protected data.`,
    timestamp: new Date()
  });
});

module.exports = app;