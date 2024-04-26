const MembershipPlan = require("../models/membershipPlan-model.js");
const ErrorResponse = require("../utils/errorResponse.js");
const asyncWrapper = require("../utils/asyncWrapper.js");

//create new membership plan (like 10er Karte, unlimited offer etc)
const createMembershipPlan = asyncWrapper(async (req, res, next) => {
  const {
    title,
    price,
    availableCredits,
    membershipDuration,
    bookableType,
    image,
    description,
  } = req.body;
  console.log("received", req.body);
  const plan = await MembershipPlan.create({
    title,
    price,
    availableCredits,
    membershipDuration,
    bookableType,
    image,
    description,
  });
  res.status(201).json(plan);
});

// Get all the available membership plans
const getMembershipPlans = asyncWrapper(async (req, res, next) => {
  const membershipPlans = await MembershipPlan.find({});
  res.json(membershipPlans);
});

// Get a single membership plan using the _id from MongoDB
const getMembershipPlan = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const plan = await MembershipPlan.findById(id);
  if (!plan) {
    throw new ErrorResponse("No Membership Plan found", 404);
  }
  res.json(plan);
});

// Update a single membership plan
const updateMembershipPlan = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const { title, price, totalCredits, validity } = req.body;

  const plan = await MembershipPlan.findByIdAndUpdate(id, {
    title,
    price,
    availableCredits,
    membershipDuration,
    bookableType,
  });
  if (!plan) {
    throw new ErrorResponse("No Membership Plan found", 404);
  }
  res.json(plan);
});

// Delete a single membership plan
//TO DO: should we really delete or only set to inactive?
const deleteMembershipPlan = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  const plan = await MembershipPlan.findByIdAndDelete(id);
  if (!plan) {
    throw new ErrorResponse("No Membership Plan found", 404);
  }
  res.json(plan);
});

module.exports = {
  createMembershipPlan,
  getMembershipPlans,
  getMembershipPlan,
  updateMembershipPlan,
  deleteMembershipPlan,
};
