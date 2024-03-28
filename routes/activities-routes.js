const express = require("express");
//TO DO: add authentication !!
const {
  createActivity,
  getActivities,
  getActivity,
  registerUserForActivity,
  unregisterUserFromActivity,
  adminUpdateActivityDetails,
} = require("../controllers/activities-controller.js");

const activityRouter = express.Router();

activityRouter.route("/").post(createActivity).get(getActivities);
activityRouter
  .route("/:activity_id")
  .get(getActivity)
  .put(registerUserForActivity);

activityRouter.route("/:activity_id/cancel").put(unregisterUserFromActivity);

activityRouter.route("/admin/:activity_id").put(adminUpdateActivityDetails); //TO DO: authenticate and authorize only admins

module.exports = activityRouter;
