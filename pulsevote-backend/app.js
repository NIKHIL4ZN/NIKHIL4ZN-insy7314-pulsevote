const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");

const authRoutes = require("./routes/authRoutes");
const { protect } = require("./middleware/authMiddleware");

const organisationRoutes = require("./routes/organisationRoutes");
const pollRoutes = require("./routes/pollRoutes");

dotenv.config();

const app = express();

app.use(
  helmet.contentSecurityPolicy({
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
      connectSrc: [
  "'self'",
  "https://localhost:5000"
]
    }
  })
);

app.use(cors({
    origin: "https://localhost:5173",
    credentials: true
}));

app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/organisations", organisationRoutes);
app.use("/api/polls", pollRoutes);

app.get("/", (req, res) => {
    res.send("PulseVote API running!");
});

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