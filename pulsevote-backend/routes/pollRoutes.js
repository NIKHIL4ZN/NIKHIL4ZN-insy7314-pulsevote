const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

const {
  createPoll,
  votePoll,
  getPollResults,
  getOrgPolls,
  closePoll,
  openPoll
} = require("../controllers/pollController");

const router = express.Router();

// Managers create polls
router.post(
  "/create-poll",
  protect,
  requireRole("manager"),
  createPoll
);

// Organisation users vote
router.post(
  "/vote/:pollId",
  protect,
  requireRole("user"),
  votePoll
);

// View poll results
router.get(
  "/get-poll-results/:pollId",
  protect,
  getPollResults
);

// View all polls in an organisation
router.get(
  "/get-polls/:organisationId",
  protect,
  getOrgPolls
);

// Close a poll
router.post(
  "/close/:pollId",
  protect,
  closePoll
);

// Open a poll
router.post(
  "/open/:pollId",
  protect,
  openPoll
);

module.exports = router;