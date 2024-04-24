const express = require("express");

const {
  createInstructor,
  getInstructors,
} = require("../controllers/instructor-controller.js");

const { authenticate, authorize } = require("../middlewares/authentication.js");

const instructorRouter = express.Router();

instructorRouter
  .route("")
  .post(
    authenticate,
    authorize("admin"),
    upload.single("image"),
    createInstructor
  )
  .get(getInstructors);

module.exports = instructorRouter;
