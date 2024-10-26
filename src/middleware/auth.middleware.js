const jwt = require("jsonwebtoken");

const tokenValidation = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: "Access Denied" });
  }
  try {
    const verified = await jwt.verify(token, process.env.JWT_SECRET);
    const { userId } = verified;
    if (!userId) {
      return res.status(401).json({ error: "Access Denied" });
    }
    req.body.userId = userId;
    next();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { tokenValidation };
