const Instructor = require("../models/instructors-model.js");
const ErrorResponse = require("../utils/errorResponse.js");
const asyncWrapper = require("../utils/asyncWrapper.js");
const mongoose = require("mongoose");

const createInstructor = asyncWrapper(async (req, res, next) => {
  const { firstName, lastName } = req.body;
  const url = req.file.path;
  const publicId = req.file.filename;
  const image = { url, publicId };

  const instructor = await Instructor.create({
    firstName,
    lastName,
    image,
  });

  res.status(201).json(instructor);
});

const getInstructors = asyncWrapper(async (req, res, next) => {
  const instructors = await Instructor.find({});

  res.json(instructors);
});

module.exports = { createInstructor, getInstructors };
