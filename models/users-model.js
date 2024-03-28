const bcrypt = require("bcrypt");
const { Schema, model } = require("mongoose");

//schema for images so that users can have profile pictures
const imageSchema = new Schema({
  url: { type: String, required: true },
  publicId: { type: String },
});

//schema for adress containing streetname etc
const addressSchema = new Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: { type: String, required: true },
});

const userSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  dateOfRegistration: { type: Date, default: Date.now() },
  lastParticipationDate: { type: Date },
  lastLoginDate: { type: Date },
  profileImage: imageSchema,
  address: addressSchema,
  role: {
    type: String,
    enum: ["student", "admin", "instructor"],
    default: "student",
  },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  activeMemberships: [
    //it is possible to have more then one membership, eg one self defense and one yoga membership
    {
      type: Schema.Types.ObjectId,
      ref: "UserMembership",
      default: null,
    },
  ],
  registeredActivities: [{ type: Schema.Types.ObjectId, ref: "Activitie" }],
  dateOfBirth: { type: Date, required: true },
  termsOfUse: { type: Boolean, required: true },
  dataProtectionInfo: { type: Boolean, required: true },
});

//creating mongoose middleware to hash passwords and make sure mail adress is lowercase
userSchema.pre("save", async function (next) {
  // this pre middleware applies directly before saving
  if (this.isModified("email")) this.email = this.email.toLowerCase(); // we check if the mail was changed or added and then lowercase it

  if (this.isModified("password"))
    // if a password is new or changed then it gets hashed
    this.password = await bcrypt.hash(this.password, 10);

  next();
});

//middleware to lowercase email addresses
userSchema.pre("findOne", function (next) {
  const query = this.getQuery();
  if (query.email) query.email = query.email.toLowerCase();
  next();
});

const User = model("User", userSchema);

module.exports = User;
