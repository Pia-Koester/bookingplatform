const express = require("express");

const {
  createUserMembership,
  getUserMemberships,
  getUserMembershipById,
  updatePaymentStatus,
} = require("../controllers/userMemberships-controller.js");
const { setUserMembership } = require("../controllers/users-controller.js");

const userMembershipRouter = express.Router();

userMembershipRouter
  .route("/")
  .post(createUserMembership, setUserMembership)
  .get(getUserMemberships);

userMembershipRouter.route("/:membershipId").get(getUserMembershipById);
userMembershipRouter
  .route("/admin/:usermembershipId/payment")
  .put(updatePaymentStatus);

module.exports = userMembershipRouter;
