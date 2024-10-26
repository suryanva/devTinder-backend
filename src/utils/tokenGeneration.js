const jwt = require("jsonwebtoken");

const tokenGeneration = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
};

module.exports = { tokenGeneration };
