const jwt = require("jsonwebtoken");
const ErrorResponse = require("../utils/errorResponse.js");
const authenticate = (req, res, next) => {
  // verify authentication
  const { authorization } = req.headers;
  console.log("the auth header is " + authorization);
  if (!authorization) {
    throw new ErrorResponse("Not Authorized!", 403);
  }

  // the auth in the headers is structured as follows: 'Bearer ddsades123ew21.dsaadwe23.d23d32' and we only need the second part, the token itself
  const token = authorization.split(" ")[1];
  console.log("the token is" + token);

  try {
    //checking wether the provided token is the correct one as saved for the user
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.user = payload;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticate,
};
