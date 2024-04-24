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

const reduceCreditOfUserMembership = asyncWrapper(async (req, res, next) => {
  const { id, activeMembership } = req.user;
  const { activity } = req;

  // Find the user's active membership
  const userActiveMemberships = await UserMembership.find({
    user: req.user._id,
    membershipStatus: "active",
  });

  if (userActiveMemberships.length === 0) {
    // If no active memberships found, do nothing and return
    res.send({ message: "No active membership found." });
    return;
  }

  // Find the user's active membership and update consumed credits
  const userMembership = await UserMembership.findByIdAndUpdate(
    activeMembership,
    { $inc: { consumedCredits: 1 } }, // Increment consumedCredits by 1
    { new: true, populate: "membershipPlan" } // Return the updated document and populate the membershipPlan field
  );

  // Check if consumed credits reach the available credits in the membership plan
  if (
    userMembership.consumedCredits ===
    userMembership.membershipPlan.availableCredits
  ) {
    // If consumed credits reach available credits, set membership status to inactive
    userMembership.status = "inactive";
    await userMembership.save(); // Save the updated userMembership
  }

  // Check if consumed credits exceed available credits in the membership plan
  if (
    userMembership.consumedCredits >
    userMembership.membershipPlan.availableCredits
  ) {
    // If consumed credits exceed available credits, set consumedCredits to availableCredits
    userMembership.consumedCredits =
      userMembership.membershipPlan.availableCredits;
    await userMembership.save(); // Save the updated userMembership
    throw new ErrorResponse("No credits remaining!", 409); // Throw an error indicating no credits remaining
  }

  // Send response with activity and updated user data
  res.send({
    activity,
    user: { ...req.user._doc, activeMembership: userMembership },
  });
});

//exporting the functions to use them in the routes
module.exports = {
  createUserMembership,
  getUserMemberships,
  getUserMembershipById,
  reduceCreditOfUserMembership,
};
