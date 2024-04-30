const express = require("express");

const {
  createUser,
  login,
  logout,
  getProfile,
  getUsers,
} = require("../controllers/users-controller.js");
const { authenticate, authorize } = require("../middlewares/authentication.js");

const userRouter = express.Router();

userRouter.route("/signup").post(createUser);
userRouter.route("/login").post(login);
userRouter.route("/logout").get(logout);

//routes only available for logged in users
userRouter.route("/users/profile").get(authenticate, getProfile);

//routes only available for admins
userRouter.route("/users").get(authenticate, authorize("admin"), getUsers);

module.exports = userRouter;
