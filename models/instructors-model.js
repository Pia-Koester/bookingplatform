const { Schema, model } = require("mongoose");

const imageSchema = new Schema({
  url: { type: String, required: true },
  publicId: { type: String },
});

const instructorSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  image: imageSchema,
});

const Instructor = model("Instructor", instructorSchema);

module.exports = Instructor;
