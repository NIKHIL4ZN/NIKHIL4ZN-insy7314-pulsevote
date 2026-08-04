const jwt = require("jsonwebtoken");

function generateToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      roles: user.roles
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h"
    }
  );
}

module.exports = generateToken;