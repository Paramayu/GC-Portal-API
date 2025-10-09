const express = require("express");
const {
  getUserInfo,
  getAllUsersAccordingToHouseOfGC,
} = require("../controllers/userController");

const Router = express.Router();

Router.get("/gc", getAllUsersAccordingToHouseOfGC);
Router.get("/:uid", getUserInfo);
Router.get("/", getUserInfo);

module.exports = Router;
