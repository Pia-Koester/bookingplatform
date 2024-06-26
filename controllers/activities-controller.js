const Activity = require("../models/activities-model.js");
const UserMembership = require("../models/userMemberships-model.js");
const User = require("../models/users-model.js");

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
    instructor,
    startTime,
    endTime,
    type,
    trialPossible,
    limitTrialSessions,
    trialSessionsUsed,
    singlePayPrice,
  } = req.body;

  //defining the weekdays for different filter functions
  const start = new Date(startTime);
  const options = { weekday: "long" };
  const weekday = new Intl.DateTimeFormat("de-De", options).format(start);

  const trialInfos = { trialPossible, limitTrialSessions, trialSessionsUsed };
  const activity = await Activity.create({
    title,
    description,
    capacity,
    instructor,
    startTime,
    endTime,
    weekday,
    type,
    trialMembership: trialInfos,
    singlePayPrice,
  });
  res.status(201).json(activity);
});

//Function to get either all activities or only activties matching the filter from frontend
const getActivities = asyncWrapper(async (req, res, next) => {
  const { instructor, start, end, type } = req.query;

  if (!start && !end) {
    const activities = await Activity.find({})
      .populate("type")
      .populate("instructor")
      .sort({
        startTime: "desc",
      });
    res.json(activities);
  } else {
    let filter = {
      startTime: {
        $gte: new Date(start),
        // Adjust the end date to include activities up to 23:59 of the end date
        $lte: new Date(new Date(end).setHours(23, 59, 59, 999)),
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
      .populate("instructor")
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
    .populate({
      path: "registeredUsers",
      populate: { path: "user" }, // Populate the 'user' field inside 'registeredUsers'
    })
    .populate("type")
    .populate("instructor"); // TODO: .populate("waitlist.waitlistUsers") is this the correct way??
  if (!activity) {
    throw new ErrorResponse("Activity not found", 404);
  }

  res.json(activity);
});

const registerUserForActivity = asyncWrapper(async (req, res, next) => {
  // Extract activity_id from request parameters and user id from request
  const { activity_id } = req.params;
  const { id } = req.user;
  const { trial } = req;

  // Find the activity based on activity_id
  const activity = await Activity.findById(activity_id);

  // Check if the user has an active membership
  const userMembership = await UserMembership.findOne({
    user: id,
    membershipStatus: "active",
  }).populate("membershipPlan");

  // Determine the payment status based on the presence of an active membership or trial
  let paymentStatus = "pending";

  if (
    userMembership &&
    userMembership.membershipPlan.bookableType.toString() ===
      activity.type.toString()
  ) {
    console.log(
      "User has an active membership for this activity type- logged from activities controller"
    );
    paymentStatus = "paid membership";
  } else if (trial) {
    paymentStatus = "trial";
  }

  if (
    trial &&
    activity.trialMembership.trialSessionsUsed >=
      activity.trialMembership.limitTrialSessions
  ) {
    throw new ErrorResponse("Trial session limit exceeded", 400);
  }

  // Update the activity's registeredUsers array with the new user and payment status
  const updatedActivity = await Activity.findByIdAndUpdate(
    activity_id,
    {
      $push: {
        registeredUsers: {
          user: id,
          paymentStatus: paymentStatus,
        },
      },
      $inc: { "trialMembership.trialSessionsUsed": trial ? 1 : 0 }, // Increase trialSessionsUsed if trial is true
    },
    { new: true } // Return the updated document
  );

  // Attach the updated activity to the request object for further processing
  req.activity = updatedActivity;

  // Move to the next middleware
  next();
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

//only admins: changing payment status and updating activity details
//Change payment status depending on the payment method
const updatePaymentStatusforActivity = asyncWrapper(async (req, res, next) => {
  const { activity_id } = req.params;
  const { user_id, paymentStatus } = req.body;

  const activity = await Activity.findById(activity_id);

  const userArray = activity.registeredUsers;
  console.log(userArray);
  const user = userArray.find((user) => user.user.toString() === user_id);

  if (!user) {
    throw new ErrorResponse("User not found in activity", 404);
  }

  user.paymentStatus = paymentStatus;
  console.log("after update", userArray);
  const updatedActivity = await Activity.findByIdAndUpdate(
    activity_id,
    {
      registeredUsers: userArray,
    },
    { new: true }
  );

  req.activity = updatedActivity;

  res.send(updatedActivity);
});

//TO DO: inform users if time has been changed
const adminUpdateActivityDetails = asyncWrapper(async (req, res, next) => {
  const { activity_id } = req.params;
  const {
    title,
    description,
    instructor,
    capacity,
    startTime,
    endTime,
    type,
    trialPossible,
    limitTrialSessions,
    singlePayPrice,
  } = req.body;
  console.log(req.body);

  const start = new Date(startTime);
  const options = { weekday: "long" };
  const weekday = new Intl.DateTimeFormat("de-DE", options)
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
      trialPossible,
      limitTrialSessions,
      singlePayPrice,
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
  updatePaymentStatusforActivity,
};
