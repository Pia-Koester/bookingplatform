const Activity = require("../models/activities-model.js");
const ErrorResponse = require("../utils/errorResponse.js");
const asyncWrapper = require("../utils/asyncWrapper.js");
const mongoose = require("mongoose");

//TO DO: in getActivities there should be NO frauenSV type classes
// New controller to get all activities in the future with frauenSV

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
  const weekday = new Intl.DateTimeFormat("de-De", options).format(start);

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
  const { instructor, start, end, type } = req.query;

  if (!start && !end) {
    const activities = await Activity.find({})
      .populate("type")
      //   .populate("instructor")
      .sort({
        startTime: "desc",
      });
    res.json(activities);
  } else {
    let filter = {
      startTime: {
        $gte: new Date(start),
        $lte: new Date(end),
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
      .populate("type")
      //   .populate("instructor")
      .sort({
        startTime: "asc",
      });

    res.json(activities);
  }
});

// get single activity based on id
const getActivity = asyncWrapper(async (req, res, next) => {
  const { activity_id } = req.params;
  const activity = await Activity.findById(activity_id)
    .populate("registeredUsers")
    .populate("type")
    .populate("instructor"); // TODO: .populate("waitlist.waitlistUsers") is this the correct way??
  if (!activity) {
    throw new ErrorResponse("Activity not found", 404);
  }

  res.json(activity);
});

//users booking classes
const registerUserForActivity = asyncWrapper(async (req, res, next) => {
  const { activity_id } = req.params;
  const { id } = req.user;
  const oldActivity = await Activity.findById(activity_id);
  const userArray = oldActivity.registeredUsers;

  const match = userArray.includes(id);
  if (match) {
    throw new ErrorResponse("This user has already registered", 409);
  } else {
    userArray.push(id);
  }
  const updatedActivity = await Activity.findByIdAndUpdate(
    activity_id,
    {
      registeredUsers: userArray,
    },
    { new: true }
  );
  req.activity = updatedActivity;

  // next(); TO DO: add other steps in the routes so that everything is properly updated
});

//removing user from class / canceling
const unregisterUserFromActivity = asyncWrapper(async (req, res, next) => {
  const { activity_id } = req.params;
  const { id } = req.user;
  const oldActivity = await Activity.findById(activity_id);
  const userArray = oldActivity.registeredUsers;

  const match = userArray.indexOf(id);

  if (match === -1) {
    throw new ErrorResponse("User not registered!", 404);
  } else {
    userArray.splice(match, 1);
  }

  const updatedActivity = await Activity.findByIdAndUpdate(
    activity_id,
    {
      registeredUsers: userArray,
    },
    { new: true }
  );
  req.activity = updatedActivity;

  next();
});

//only admins: update activity details
//TO DO: inform users if time has been changed
const adminUpdateActivityDetails = asyncWrapper(async (req, res, next) => {
  const { activity_id } = req.params;
  const { title, description, instructor, capacity, startTime, endTime, type } =
    req.body;

  const start = new Date(startTime);
  const options = { weekday: "long" };
  const weekday = new Intl.DateTimeFormat("en-En", options)
    .format(start)
    .toLowerCase();

  const updatedActivity = await Activity.findByIdAndUpdate(
    activity_id,
    {
      title,
      description,
      instructor,
      capacity,
      startTime,
      endTime,
      type,
      weekday,
    },
    { new: true }
  );
  res.json(updatedActivity);
});

//exporting the functions to use in the routes
module.exports = {
  createActivity,
  getActivities,
  getActivity,
  registerUserForActivity,
  unregisterUserFromActivity,
  adminUpdateActivityDetails,
};
