const { Schema, model } = require("mongoose");

const waitlistSchema = new Schema({
  active: { type: Boolean },
  waitlistUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
});

//schema for adress containing streetname etc
const addressSchema = new Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: { type: String, required: true },
});

const activitySchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  weekday: { type: String, lowercase: true },
  capacity: { type: Number },
  waitlist: waitlistSchema,
  instructor: { type: Schema.Types.ObjectId, ref: "Instructor" },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
      default: "Point",
    },
    coordinates: {
      type: [Number],
      required: true,
      index: "2dsphere",
      default: [53.58044198674046, 9.97947668337071],
    },
    address: addressSchema,
  },
  //registeredUser must contain referenc to User and then the different payment status
  registeredUsers: [
    {
      user: { type: Schema.Types.ObjectId, ref: "User" },
      paymentStatus: {
        type: String,
        enum: ["pending", "paid card", "paid cash", "paid membership"],
        default: "pending",
      },
    },
    //TO DO: 10er Karte soll erst abgebucht werden - wenn 24h vor Kursstart nicht abgemeldet
  ],
  trialMembership: { type: Boolean, default: true },
  type: { type: Schema.Types.ObjectId, ref: "Activitytype" },
  singlePayOnly: { type: Boolean, defaul: false },
  // To Do: if singlePayOnly is true no booking using membership is possible
});

activitySchema.pre("save", async function (next) {
  // this pre middleware applies directly before saving
  if (this.isModified("weekday")) this.weekday = this.weekday.toLowerCase();
  next();
});

const Activity = model("Activitie", activitySchema);

module.exports = Activity;
