const express = require("express");
const {
  sendOTP,
  registerUser,
  loginUser,
  logoutUser,
} = require("../controllers/authController");
const Router = express.Router();

Router.post("/sendotp", sendOTP);
Router.post("/signup", registerUser);
Router.post("/login", loginUser);
Router.post("/logout", logoutUser);

module.exports = Router;
