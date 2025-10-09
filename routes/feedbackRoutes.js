const express = require("express");
const {
  createFeedback,
  updateFeedback,
} = require("../controllers/feedbackController");

const Router = express.Router();

Router.patch("/update/:id", updateFeedback);
Router.post("/", createFeedback);

module.exports = Router;
