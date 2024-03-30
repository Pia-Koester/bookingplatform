const { Schema, model } = require("mongoose");

const userMembershipSchema = new Schema({
  membershipPlan: {
    type: Schema.Types.ObjectId,
    ref: "MembershipPlan",
    required: true,
  },
  purchaseDate: { type: Date, default: Date.now() },
  expiryDate: { type: Date },
  membershipStatus: {
    type: String,
    enum: ["payment pending", "active", "inactive"],
    default: "payment pending",
  },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  consumedCredits: { type: Number, default: 0 },
  remainingCredits: { type: Number, default: 0 },
});

const UserMembership = model("UserMembership", userMembershipSchema);

module.exports = UserMembership;
