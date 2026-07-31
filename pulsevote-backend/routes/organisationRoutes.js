const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

const {
  createOrganisation,
  generateJoinCode,
  joinOrganisation
} = require("../controllers/organisationController");

const router = express.Router();

// Only managers can create organisations
router.post(
  "/create-organisation",
  protect,
  requireRole("manager"),
  createOrganisation
);

// Only managers can regenerate join codes
router.post(
  "/generate-join-code/:organisationId",
  protect,
  requireRole("manager"),
  generateJoinCode
);

// Any authenticated user can join an organisation
router.post(
  "/join-organisation",
  protect,
  joinOrganisation
);

module.exports = router;