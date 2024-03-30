const UserMembership = require("../models/userMemberships-model.js");
const ErrorResponse = require("../utils/errorResponse.js");
const asyncWrapper = require("../utils/asyncWrapper.js");

// after booking a specific membership plan users a new usermembership needs to be created
const createUserMembership = asyncWrapper(async (req, res, next) => {
  const { membershipPlan, user, expiryDate } = req.body;

  //first check if user already has a membership of this type
  // check the UserMembership collection for this user and an active status together with the id of the membershipPlan
  const existingMembership = await UserMembership.findOne({
    user,
    membershipStatus: "active",
    membershipPlan: membershipPlan,
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

//exporting the functions to use them in the routes
module.exports = {
  createUserMembership,
  getUserMemberships,
  getUserMembershipById,
};
