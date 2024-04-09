const jwt = require("jsonwebtoken");
const ErrorResponse = require("../utils/errorResponse.js");

const authenticate = (req, res, next) => {
  try {
    const { access_token: token } = req.cookies;

    if (!token) {
      throw new ErrorResponse("Forbidden!", 403);
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.user = payload;

    next();
  } catch (error) {
    next(error);
  }
};

const authorize = (role) => {
  return (req, res, next) => {
    if (role === req.user.role) {
      return next();
    }
    res.status(401).send("unauthorized");
  };
};

module.exports = {
  authenticate,
  authorize,
};
