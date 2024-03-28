const Activity = require("../models/activities-model.js");
const ErrorResponse = require("../utils/errorResponse.js");
const asyncWrapper = require("../utils/asyncWrapper.js");
const mongoose = require("mongoose");

const createActivity = asyncWrapper(async (req, res, next) => {
  //TO DO: Date ranges and repeating circle from frontend should enable admins to create multiple activities at once
  const {
    title,
    description,
    capacity,
    // waitlist,
    instructor,
    //location,
    startTime,
    endTime,
    type,
  } = req.body;

  //defining the weekdays for different filter functions
  const start = new Date(startTime);
  const options = { weekday: "long" };
  const weekday = new Intl.DateTimeFormat("en-En", options).format(start);

  const activity = await Activity.create({
    title,
    description,
    capacity,
    instructor,
    startTime,
    endTime,
    weekday,
    type,
  });
  res.status(201).json(activity);
});

//Function to get either all activities or only activties matching the filter from frontend
const getActivities = asyncWrapper(async (req, res, next) => {
  const { instructor, mon, sun, type } = req.query;

  if (!mon && !sun) {
    const activities = await Activity.find({})
      //   .populate("type")
      //   .populate("instructor")
      .sort({
        startTime: "desc",
      });
    res.json(activities);
  } else {
    let filter = {
      startTime: {
        $gte: new Date(mon),
        $lte: new Date(sun),
      },
    };

    const queryParams = { instructor, type };

    for (const key of Object.keys(queryParams)) {
      const value = queryParams[key];
      if (value !== undefined) {
        filter[key] = value;
      }
    }

    const activities = await Activity.find(filter)
      //   .populate("type")
      //   .populate("instructor")
      .sort({
        startTime: "asc",
      });

    res.json(activities);
  }
});

//exporting the functions to use in the routes
module.exports = {
  createActivity,
  getActivities,
};
