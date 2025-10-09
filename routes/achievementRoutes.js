const express = require("express");
const {
  updateAchievement,
  deleteOrRestoreAchievement,
  createAchievement,
} = require("../controllers/achievementController");

const Router = express.Router();

Router.patch("/update/:id", updateAchievement);
Router.delete("/:id", deleteOrRestoreAchievement);
Router.patch("/:id", deleteOrRestoreAchievement);
Router.post("/", createAchievement);

module.exports = Router;
