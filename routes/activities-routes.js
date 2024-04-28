const express = require("express");
//TO DO: add authentication !!
const {
  createActivity,
  getActivities,
  getActivity,
  registerUserForActivity,
  unregisterUserFromActivity,
  adminUpdateActivityDetails,
  updatePaymentStatusforActivity,
} = require("../controllers/activities-controller.js");
const { authenticate, authorize } = require("../middlewares/authentication.js");
const {
  reduceCreditOfUserMembership,
} = require("../controllers/userMemberships-controller.js");
const {
  updateActivitiesForUser,
  createUser,
  login,
} = require("../controllers/users-controller.js");

const activityRouter = express.Router();

activityRouter.route("/").post(createActivity).get(getActivities);
activityRouter
  .route("/:activity_id/trial")
  .post(createUser, login, registerUserForActivity, updateActivitiesForUser);
activityRouter
  .route("/:activity_id")
  .get(getActivity)
  .put(
    authenticate,
    registerUserForActivity,
    updateActivitiesForUser,
    reduceCreditOfUserMembership
  );

activityRouter.route("/:activity_id/cancel").put(unregisterUserFromActivity);

activityRouter.route("/admin/:activity_id").put(adminUpdateActivityDetails); //TO DO: authenticate and authorize only admins
activityRouter
  .route("/admin/:activity_id/payment")
  .put(updatePaymentStatusforActivity); //TO DO: authenticate and authorize only admins
module.exports = activityRouter;
