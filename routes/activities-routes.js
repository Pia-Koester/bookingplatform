const express = require("express");

const {
  createActivity,
  getActivities,
} = require("../controllers/activities-controller.js");

const activityRouter = express.Router();

activityRouter.route("/").post(createActivity).get(getActivities);

module.exports = activityRouter;
