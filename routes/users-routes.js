const express = require("express");

const {
  createUser,
  login,
  logout,
  getProfile,
} = require("../controllers/users-controller.js");
const { authenticate } = require("../middlewares/authentication.js");

const userRouter = express.Router();

userRouter.route("/signup").post(createUser);
userRouter.route("/login").post(login);
userRouter.route("/logout").get(logout);

//routes only available for logged in users
userRouter.route("/users/profile").get(authenticate, getProfile);

module.exports = userRouter;
