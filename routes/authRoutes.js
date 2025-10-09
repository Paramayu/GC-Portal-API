const express = require("express");
const {
  sendOTP,
  registerUser,
  loginUser,
  logoutUser,
} = require("../controllers/authController");
const otpRateLimit = require("../util/otpRateLimiter");
const Router = express.Router();

Router.post("/sendotp", otpRateLimit({ windowSeconds: 120 }), sendOTP);
Router.post("/signup", registerUser);
Router.post("/login", loginUser);
Router.post("/logout", logoutUser);

module.exports = Router;
