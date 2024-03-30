const express = require("express");

const {
  createType,
  getTypes,
} = require("../controllers/activityTypes-controller.js");

const uploadMultiple = require("../middlewares/uploadmultipleImages.js");
const { cloudinaryUpload } = require("../middlewares/cloudinary.js");

const typeRouter = express.Router();

typeRouter
  .route("/")
  .post(uploadMultiple, cloudinaryUpload, createType)
  .get(getTypes);

module.exports = typeRouter;
