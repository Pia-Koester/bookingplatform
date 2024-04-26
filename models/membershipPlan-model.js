const { Schema, model } = require("mongoose");

const membershipPlanSchema = new Schema({
  title: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  membershipDuration: { type: Number },
  availableCredits: { type: Number, required: true },
  description: { type: String },
  image: { type: String },
  bookableType: {
    // This is to differentiate between different forms of activity in case certain memberships only allow booking of certain types
    type: Schema.Types.ObjectId,
    ref: "ActivityType",
    required: true,
  },
});

const MembershipPlan = model("MembershipPlan", membershipPlanSchema);

module.exports = MembershipPlan;
