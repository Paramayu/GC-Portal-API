const express = require("express");
const Router = express.Router();
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const achievementRoutes = require("./achievementRoutes");
const feedbackRoutes = require("./feedbackRoutes");

Router.use("/auth", authRoutes);
Router.use("/user", userRoutes);
Router.use(["/activity", "/award", "/university"], achievementRoutes);
Router.use("/feedback", feedbackRoutes);
module.exports = Router;
