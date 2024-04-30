const Instructor = require("../models/instructors-model.js");
const ErrorResponse = require("../utils/errorResponse.js");
const asyncWrapper = require("../utils/asyncWrapper.js");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

const createInstructor = asyncWrapper(async (req, res, next) => {
  const { firstName, lastName } = req.body;
  const { uploadedImages } = req;
  console.log(uploadedImages);
  const imagesData = uploadedImages.map((image) => ({
    url: image.url,
    publicId: image.public_id,
  }));

  const instructor = await Instructor.create({
    firstName,
    lastName,
    image: imagesData[0],
  });

  res.status(201).json(instructor);
});

const getInstructors = asyncWrapper(async (req, res, next) => {
  const instructors = await Instructor.find({});

  res.json(instructors);
});

module.exports = { createInstructor, getInstructors };
