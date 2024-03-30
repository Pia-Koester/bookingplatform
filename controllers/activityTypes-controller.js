const ActivityType = require("../models/activityTypes-model.js");
const ErrorResponse = require("../utils/errorResponse.js");
const asyncWrapper = require("../utils/asyncWrapper.js");
const cloudinary = require("cloudinary").v2;

// admins can create new acitivity types: e.g. Krav Maga, Yoga
const createType = asyncWrapper(async (req, res, next) => {
  const { type } = req.body;

  const { uploadedImages } = req;
  const imagesData = uploadedImages.map((image) => ({
    url: image.url,
    publicId: image.public_id,
  }));
  const newActivityType = await ActivityType.create({
    type: type.toLowerCase(),
    images: imagesData,
  });

  res.status(201).json(newActivityType);
});

// GET for all available types, this is necessarry for the admin dashboard and dropdown to create new activities
const getTypes = asyncWrapper(async (req, res, next) => {
  const activitytype = await ActivityType.find({});
  res.json(activitytype);
});

module.exports = { createType, getTypes };
