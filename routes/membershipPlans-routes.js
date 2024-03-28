const express = require("express");

const {
  createMembershipPlan,
  getMembershipPlans,
  getMembershipPlan,
  updateMembershipPlan,
  deleteMembershipPlan,
} = require("../controllers/membershipPlan-controller.js");

const membershipPlanRouter = express.Router();

//GET all membershipPlans,
//TO DO: authenticate and only show to logged in users??
membershipPlanRouter.get("/", getMembershipPlans);

//creating a new membershipPlan
//TO DO: only admins can do this
membershipPlanRouter.post("/create", createMembershipPlan);
// GET one individual membership based on the _id
membershipPlanRouter.get("/:id", getMembershipPlan);

//updating one membershipPlan
//TO DO only admins
membershipPlanRouter.put("/update/:id", updateMembershipPlan); // updates one individual membership based on the _id

module.exports = membershipPlanRouter;
