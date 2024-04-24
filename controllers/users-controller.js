const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/users-model.js");
const asyncWrapper = require("../utils/asyncWrapper.js");

// ********** Functions relating to the account, login and profile **************
//create new user
const createUser = asyncWrapper(async (req, res, next) => {
  const {
    email,
    phoneNumber,
    password,
    firstName,
    lastName,
    dateOfBirth,
    activeMemberships,
    registeredActivities,
    termsOfUse,
    dataProtectionInfo,
    street,
    postalCode,
    city,
    role = "student",
  } = req.body;

  const address = { street, postalCode, city };

  const found = await User.findOne({ email });
  if (found) {
    throw new ErrorResponse("User already exists!", 409);
  }

  const user = await User.create({
    email,
    phoneNumber,
    password,
    firstName,
    lastName,
    dateOfBirth,
    activeMemberships,
    registeredActivities,
    termsOfUse,
    dataProtectionInfo,
    address,
    role,
  });

  res.status(201).json(user);
});

//user login
const login = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email })
    .select("+password")
    .populate({
      path: "registeredActivities",
      populate: { path: "instructor", model: "Instructor" },
    })
    .populate({
      path: "activeMemberships",
      populate: { path: "membershipPlan", model: "MembershipPlan" },
    });

  if (!user) {
    throw new ErrorResponse("User does not exist!", 404);
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw new ErrorResponse("Incorrect Password!", 401);
  }

  const payload = {
    id: user._id,
    email: user.email,
    firstName: user.firstName,
    role: user.role,
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "480m",
  });

  delete user.password;

  res
    .cookie("access_token", token, {
      httpOnly: true,
      maxAge: 28800000,
      domain: ".artemis-sports.de",
      // secure: true, TO DO set this in prod - not dev
    })
    .json(user);
});

//user logout
const logout = asyncWrapper(async (req, res, next) => {
  res
    .cookie("access_token", "", { httpOnly: true, maxAge: 0 })
    .json({ success: true });
});

// user information / profile only available after login
const getProfile = asyncWrapper(async (req, res, next) => {
  const { id } = req.user;

  const user = await User.findById(id)
    .populate({
      path: "registeredActivities",
      // populate: { path: "instructor", model: "Instructor" },
    })
    .populate({
      path: "activeMemberships",
      populate: { path: "membershipPlan", model: "MembershipPlan" },
    });
  res.json(user);
});

// ********** Functions relating to booking and purchases **************
//after booking a membership the users active memberships array needs to be filled
const setUserMembership = asyncWrapper(async (req, res, next) => {
  const { _id, user } = req.userMembership;

  // Add the new membership to the user's activeMemberships array
  const membershipHolder = await User.findByIdAndUpdate(
    user,
    { $push: { activeMemberships: _id } },
    { new: true }
  ).populate({
    path: "activeMemberships",
    populate: { path: "membershipPlan", model: "MembershipPlan" },
  });

  res.json(membershipHolder.activeMemberships);
});

// after booking an activity the users registered activities array needs to be filled
const updateActivitiesForUser = asyncWrapper(async (req, res, next) => {
  const { id } = req.user;
  const { activity } = req;
  const { _id: activity_id } = activity; // Destructure directly

  // Retrieve old user data
  const oldUser = await User.findById(id);

  if (!oldUser) {
    throw new ErrorResponse("User not found", 404);
  }

  const { registeredActivities } = oldUser;

  // Check if activity_id is already registered
  const isRegistered = registeredActivities.includes(activity_id);

  if (isRegistered) {
    throw new ErrorResponse("User already registered", 409);
  }

  // Update the user's data
  const updatedUser = await User.findByIdAndUpdate(
    id,
    { $push: { registeredActivities: activity_id } },

    {
      new: true,
      // populate: {
      //   path: "registeredActivities",
      //   populate: { path: "instructor", model: "Instructor" },
      // },
    }
  );

  req.user = updatedUser;

  next();
});

module.exports = {
  createUser,
  setUserMembership,
  login,
  logout,
  getProfile,
  updateActivitiesForUser,
};
