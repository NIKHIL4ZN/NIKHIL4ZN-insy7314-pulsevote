const Poll = require("../models/Poll");
const Organisation = require("../models/Organisation");
const User = require("../models/User");

function hasOrganisationRole(user, organisationId, roleName) {
  return user.roles.some(
    (role) => role.role === roleName && role.organisationId?.toString() === organisationId.toString()
  );
}

exports.createPoll = async (req, res) => {
  try {
    const { organisationId } = req.body;
    const question = req.body.question?.trim();
    const options = Array.isArray(req.body.options)
      ? req.body.options.map((option) => String(option).trim()).filter(Boolean)
      : [];

    if (!question) return res.status(400).json({ message: "Poll question is required" });
    if (options.length < 2) {
      return res.status(400).json({ message: "A poll must have at least two options" });
    }
    if (new Set(options.map((option) => option.toLowerCase())).size !== options.length) {
      return res.status(400).json({ message: "Poll options must be unique" });
    }

    const org = await Organisation.findById(organisationId);
    if (!org) return res.status(404).json({ message: "Organisation not found" });

    const poll = await Poll.create({
      organisationId,
      question,
      options,
      createdBy: req.user.id
    });

    return res.status(201).json({ message: "Poll created", poll });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
};

exports.votePoll = async (req, res) => {
  try {
    const { pollId } = req.params;
    const { optionIndex } = req.body;

    const poll = await Poll.findById(pollId);
    if (!poll) return res.status(404).json({ message: "Poll not found" });
    if (poll.status !== "open") return res.status(400).json({ message: "Poll is closed" });

    const user = await User.findById(req.user.id).lean();
    if (!hasOrganisationRole(user, poll.organisationId, "user")) {
      return res.status(403).json({ message: "Only organisation users may vote in this poll" });
    }

    if (!Number.isInteger(optionIndex) || optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({ message: "Invalid poll option" });
    }

    const alreadyVoted = poll.votes.some((vote) => vote.userId.toString() === req.user.id);
    if (alreadyVoted) return res.status(409).json({ message: "You have already voted" });

    poll.votes.push({ userId: req.user.id, optionIndex });
    await poll.save();

    return res.json({ message: "Vote recorded", poll });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
};

exports.getPollResults = async (req, res) => {
  try {
    const { pollId } = req.params;
    const poll = await Poll.findById(pollId).lean();
    if (!poll) return res.status(404).json({ message: "Poll not found" });

    const user = await User.findById(req.user.id).lean();
    const isAdmin = user.roles.some((role) => role.role === "admin");
    const isMember = user.roles.some(
      (role) => role.organisationId?.toString() === poll.organisationId.toString()
    );

    if (!isAdmin && !isMember) {
      return res.status(403).json({ message: "Not a member of this organisation" });
    }

    const counts = Array(poll.options.length).fill(0);
    for (const vote of poll.votes || []) {
      if (Number.isInteger(vote.optionIndex) && vote.optionIndex >= 0 && vote.optionIndex < counts.length) {
        counts[vote.optionIndex] += 1;
      }
    }

    const totalVotes = counts.reduce((sum, count) => sum + count, 0);
    const percentages = counts.map((count) =>
      totalVotes ? Number(((count / totalVotes) * 100).toFixed(2)) : 0
    );
    const userVote = poll.votes?.find((vote) => vote.userId?.toString() === req.user.id);

    return res.json({
      poll: {
        _id: poll._id,
        organisationId: poll.organisationId,
        question: poll.question,
        options: poll.options,
        status: poll.status
      },
      results: {
        counts,
        percentages,
        totalVotes,
        userVoteIndex: userVote ? userVote.optionIndex : null
      }
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
};

exports.getOrgPolls = async (req, res) => {
  try {
    const { organisationId } = req.params;
    const user = await User.findById(req.user.id).lean();
    const isAdmin = user.roles.some((role) => role.role === "admin");
    const isMember = user.roles.some(
      (role) => role.organisationId?.toString() === organisationId
    );

    if (!isAdmin && !isMember) {
      return res.status(403).json({ message: "Not a member of this organisation" });
    }

    const polls = await Poll.find({ organisationId }).sort({ _id: -1 });
    return res.json(polls);
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
};

async function setPollStatus(req, res, status) {
  try {
    const poll = await Poll.findById(req.params.pollId);
    if (!poll) return res.status(404).json({ message: "Poll not found" });

    const user = await User.findById(req.user.id).lean();
    const isAdmin = user.roles.some((role) => role.role === "admin");
    const isManager = hasOrganisationRole(user, poll.organisationId, "manager");

    if (!isAdmin && !isManager) {
      return res.status(403).json({ message: "Not a manager of this organisation" });
    }

    poll.status = status;
    await poll.save();
    return res.json({ message: `Poll ${status}`, poll });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
}

exports.closePoll = (req, res) => setPollStatus(req, res, "closed");
exports.openPoll = (req, res) => setPollStatus(req, res, "open");