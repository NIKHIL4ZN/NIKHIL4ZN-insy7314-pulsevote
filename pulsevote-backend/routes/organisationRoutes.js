const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

const {
  createOrganisation,
  getMyOrganisations,
  generateJoinCode,
  joinOrganisation
} = require("../controllers/organisationController");

const router = express.Router();

router.get(
  "/my-organisations",
  protect,
  getMyOrganisations
);

router.post(
  "/create-organisation",
  protect,
  requireRole("manager"),
  createOrganisation
);

router.post(
  "/generate-join-code/:organisationId",
  protect,
  requireRole("manager"),
  generateJoinCode
);

router.post(
  "/join-organisation",
  protect,
  joinOrganisation
);

module.exports = router;