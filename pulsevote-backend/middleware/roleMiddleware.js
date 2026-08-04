const User = require("../models/User");

const requireRole = (role) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(401).json({
          message: "User not found"
        });
      }

      if (role === "admin") {
        const isAdmin = user.roles.some(r => r.role === "admin");

        if (!isAdmin) {
          return res.status(403).json({
            message: "Forbidden"
          });
        }

        return next();
      }

      const orgId =
  req.params.organisationId ||
  req.body?.organisationId;

      const hasRole = user.roles.some(r =>
        r.role === role &&
        (!orgId ||
          r.organisationId?.toString() === orgId)
      );

      if (!hasRole && !user.roles.some(r => r.role === "admin")) {
        return res.status(403).json({
          message: "Forbidden"
        });
      }

      next();

    } catch (err) {
      console.error(err);

      res.status(500).json({
        error: "Server error"
      });
    }
  };
};

module.exports = { requireRole };