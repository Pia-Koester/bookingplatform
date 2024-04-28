const UserMembership = require("../models/userMemberships-model.js");
const ErrorResponse = require("../utils/errorResponse.js");
const User = require("../models/users-model.js");
const asyncWrapper = require("../utils/asyncWrapper.js");

// after booking a specific membership plan users a new usermembership needs to be created
const createUserMembership = asyncWrapper(async (req, res, next) => {
  const { membershipPlan, user, expiryDate } = req.body;

  //first check if user already has a membership of this type
  // check the UserMembership collection for this user and an active status together with the id of the membershipPlan
  const existingMembership = await UserMembership.findOne({
    user,
    membershipStatus: "active",
    membershipPlan,
  }).populate("membershipPlan");

  if (existingMembership) {
    throw new ErrorResponse(
      "User already has an active membership of the same type",
      400
    );
  }

  //if no active membership with the given id already exists a new membership is created
  const userMembership = await UserMembership.create({
    membershipPlan,
    user,
    expiryDate,
  });

  req.userMembership = userMembership;

  next();
});

//GET all the user memberships
//TO DO: do we need this function?
const getUserMemberships = asyncWrapper(async (req, res, next) => {
  const userMemberships = await UserMembership.find({})
    .populate("user")
    .populate("plan");

  if (userMemberships.length === 0) {
    throw new ErrorResponse("No results found!", 404);
  } else {
    res.status(200).json(userMemberships);
  }
});

//GET one specific user membership by id provided from frontend
const getUserMembershipById = asyncWrapper(async (req, res, next) => {
  const { membershipId } = req.params;

  const userMembership = await UserMembership.findById(membershipId)
    .populate("user")
    .populate("plan");

  if (!userMembership) {
    throw new ErrorResponse("User membership not found!", 404);
  } else {
    res.status(200).json(userMembership);
  }
});

const reduceCreditOfUserMembership = asyncWrapper(async (req, res, next) => {
  const { id } = req.user;
  const { activity } = req;

  // Find the user's active membership
  const userActiveMemberships = await UserMembership.find({
    user: id,
    membershipStatus: "active",
  }).populate("membershipPlan");
  // what happens if user has no membership?
  if (userActiveMemberships.length === 0) {
    // If no active memberships found, booking is still possible, no credits consumed
    return res.send({
      activity, // activity already contains the new user data from middleware before
      user: req.user, // Send user data without changes
    });
  }

  // Find the active membership that matches the bookableType of the activity
  const matchingMembership = userActiveMemberships.find(
    (membership) =>
      membership.membershipPlan.bookableType.toString() ===
      activity.type.toString()
  );

  // Check if a matching membership is found
  if (!matchingMembership) {
    // If no matching membership found for the activity, return appropriate response
    return res.send({
      activity,
      user: req.user,
      message: "No active membership found for this activity.",
    });
  }

  // Update consumed credits for the matching membership
  matchingMembership.consumedCredits += 1;

  // Check if consumed credits exceed available credits in the membership plan
  if (
    matchingMembership.consumedCredits >
    matchingMembership.membershipPlan.availableCredits
  ) {
    matchingMembership.consumedCredits =
      matchingMembership.membershipPlan.availableCredits;
    await matchingMembership.save(); // Save the updated membership
    throw new ErrorResponse("No credits remaining!", 409); // Throw an error indicating no credits remaining
  }

  // Check if consumed credits reach the available credits in the membership plan
  if (
    matchingMembership.consumedCredits ===
    matchingMembership.membershipPlan.availableCredits
  ) {
    matchingMembership.status = "inactive"; // Set membership status to inactive
  }

  await matchingMembership.save(); // Save the updated membership

  // Populate the updated user with registeredActivities and activeMemberships
  const updatedUser = await User.findById(id)
    .populate({
      path: "registeredActivities",
      populate: { path: "instructor", model: "Instructor" },
    })
    .populate({
      path: "activeMemberships",
      populate: { path: "membershipPlan", model: "MembershipPlan" },
    });

  // Send response with activity and updated user data
  res.send({
    activity,
    user: updatedUser,
  });
});

//exporting the functions to use them in the routes
module.exports = {
  createUserMembership,
  getUserMemberships,
  getUserMembershipById,
  reduceCreditOfUserMembership,
};
