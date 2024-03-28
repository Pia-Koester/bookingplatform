const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/users-model.js");
const asyncWrapper = require("../utils/asyncWrapper.js");

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
    address,
    role = "student",
  } = req.body;

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

module.exports = { createUser };
