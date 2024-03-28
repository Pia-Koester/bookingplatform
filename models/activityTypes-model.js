const { Schema, model } = require("mongoose");

const imageSchema = new Schema({
  url: { type: String, required: true },
  publicId: { type: String },
});

const activityTypeSchema = new Schema({
  type: { type: String, required: true, unique: true, lowercase: true },
  images: [imageSchema],
  icon: { type: String },
});

const ActivityType = model("Activitytype", activityTypeSchema);

module.exports = ActivityType;
