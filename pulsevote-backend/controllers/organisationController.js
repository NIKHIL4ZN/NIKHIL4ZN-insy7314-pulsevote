const Organisation = require("../models/Organisation");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

exports.createOrganisation = async (req, res) => {
  try {
    const name = req.body.name?.trim();

    if (!name) {
      return res.status(400).json({
        message: "Organisation name is required"
      });
    }

    const existing = await Organisation.findOne({ name });

    if (existing) {
      return res.status(400).json({
        message: "Organisation name already exists"
      });
    }

    const org = new Organisation({
      name,
      createdBy: req.user.id,
      members: [req.user.id]
    });

    org.generateJoinCode();
    await org.save();

    const user = await User.findById(req.user.id);

    const alreadyManager = user.roles.some(
      role =>
        role.role === "manager" &&
        role.organisationId?.toString() === org._id.toString()
    );

    if (!alreadyManager) {
      user.roles.push({
        organisationId: org._id,
        role: "manager"
      });

      await user.save();
    }

    return res.status(201).json({
      message: "Organisation created",
      organisation: org,
      token: generateToken(user)
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Server error"
    });
  }
};

exports.getMyOrganisations = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();

    if (!user) {
      return res.status(401).json({
        message: "User not found"
      });
    }

    const isAdmin = user.roles.some(role => role.role === "admin");

    const organisationIds = user.roles
      .filter(role => role.organisationId)
      .map(role => role.organisationId);

    const query = isAdmin
      ? {}
      : { _id: { $in: organisationIds } };

    const organisations = await Organisation.find(query)
      .sort({ name: 1 })
      .lean();

    return res.json(organisations);

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Server error"
    });
  }
};

exports.generateJoinCode = async (req, res) => {
  try {
    const { organisationId } = req.params;

    const org = await Organisation.findById(organisationId);

    if (!org) {
      return res.status(404).json({
        message: "Organisation not found"
      });
    }

    org.generateJoinCode();

    await org.save();

    return res.json({
      message: "Join code regenerated",
      joinCode: org.joinCode
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Server error"
    });
  }
};

exports.joinOrganisation = async (req, res) => {
  try {
    const joinCode = req.body.joinCode?.trim();

    if (!joinCode) {
      return res.status(400).json({
        message: "Join code is required"
      });
    }

    const org = await Organisation.findOne({ joinCode });

    if (!org) {
      return res.status(404).json({
        message: "Invalid join code"
      });
    }

    const user = await User.findById(req.user.id);

    const alreadyJoined = user.roles.some(
      role =>
        role.role === "user" &&
        role.organisationId?.toString() === org._id.toString()
    );

    if (alreadyJoined) {
      return res.status(409).json({
        message: "You have already joined this organisation"
      });
    }

    if (
      !org.members.some(
        memberId => memberId.toString() === req.user.id
      )
    ) {
      org.members.push(req.user.id);
      await org.save();
    }

    user.roles.push({
      organisationId: org._id,
      role: "user"
    });

    await user.save();

    return res.json({
      message: "Joined organisation",
      organisation: org,
      token: generateToken(user)
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Server error"
    });
  }
};