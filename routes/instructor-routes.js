const express = require("express");

const {
  createInstructor,
  getInstructors,
} = require("../controllers/instructor-controller.js");

const { authenticate, authorize } = require("../middlewares/authentication.js");
const uploadMultiple = require("../middlewares/uploadmultipleImages.js");
const { cloudinaryUpload } = require("../middlewares/cloudinary.js");

const instructorRouter = express.Router();

instructorRouter
  .route("")
  .post(
    authenticate,
    authorize("admin"),
    uploadMultiple,
    cloudinaryUpload,
    createInstructor
  )
  .get(getInstructors);

module.exports = instructorRouter;
