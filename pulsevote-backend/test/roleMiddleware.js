const requireRole = (roleName) => {
  return (req, res, next) => {
    if (!req.user?.roles?.some((role) => role.role === roleName)) {
      return res.status(403).json({
        message: "Forbidden"
      });
    }

    next();
  };
};

module.exports = { requireRole };