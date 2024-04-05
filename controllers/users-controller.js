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
      // populate: { path: "instructor", model: "Instructor" },
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

  res.json({ token, user });
});

//user logout
//TO DO: token must be removed from local storage in frontend!!!
const logout = asyncWrapper(async (req, res, next) => {
  res.json({ success: true });
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

module.exports = { createUser, setUserMembership, login, logout, getProfile };
