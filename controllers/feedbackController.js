const session = require("express-session");
const Activity = require("../models/Activity-Model");
const Feedback = require("../models/Feedback-Model");
const User = require("../models/User-Model");
const { mongo, default: mongoose } = require("mongoose");
const verifyToken = require("../util/authorization");
const HTTPError = require("../util/http-error");

const createFeedback = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    //Verify Token
    const verifiedTokenData = verifyToken(req, res);
    //Scraps everything if the token data is 0 since there is an error
    if (verifiedTokenData == 0) {
      return;
    }
    const { id: gcId, email, role } = verifiedTokenData;
    if (role !== "gc") {
      return res.status(401).json({ message: "Unauthorized." });
    }
    const { feedback, activityId } = req.body;
    if (!feedback || !activityId) {
      return res
        .status(400)
        .json({ message: "Bad Request. Please send all the needed data" });
    }

    const gc = await User.findById(gcId);
    if (!gc) {
      res.clearCookie("token");
      return res
        .status(404)
        .json({ message: "User not found. Please Login Again" });
    }
    const activity = await Activity.findById(activityId).populate(
      "userId",
      "house"
    );
    if (!activity) {
      res.clearCookie("token");
      return res.status(404).json({ message: "Activity not found" });
    }
    console.log(activity);
    if (activity.userId.house !== gc.house) {
      return res.status(401).json({ message: "Unauthorized." });
    }
    const newFeedBack = new Feedback({
      feedback,
      gcId,
      studentId: activity.userId._id,
    });
    await newFeedBack.save({ session });
    activity.feedbacks.push(newFeedBack.id);
    await activity.save({ session });
    await session.commitTransaction();
    const { deleted, ...feedbacktosend } = newFeedBack.toObject();
    return res
      .status(200)
      .json({ message: "Feedback added successfully", feedback: newFeedBack });
  } catch (err) {
    await session.abortTransaction();
    return next(
      new HTTPError(
        "Could not create feedback due to internal server error",
        500,
        err
      )
    );
  } finally {
    await session.endSession();
  }
};

const updateFeedback = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    //Verify Token
    const verifiedTokenData = verifyToken(req, res);
    //Scraps everything if the token data is 0 since there is an error
    if (verifiedTokenData == 0) {
      return;
    }
    const { id: gcId, email, role } = verifiedTokenData;
    if (role !== "gc") {
      return res.status(401).json({ message: "Unauthorized." });
    }
    const { feedback: newFeedBack } = req.body;
    const { id } = req.params;
    if (!newFeedBack) {
      return res
        .status(400)
        .json({ message: "Bad Request. Please send all the needed data" });
    }

    const gc = await User.findById(gcId);
    if (!gc) {
      res.clearCookie("token");
      return res
        .status(404)
        .json({ message: "User not found. Please Login Again" });
    }
    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }
    if (gcId != feedback.gcId) {
      return res.status(401).json({ message: "Unauthorized." });
    }
    feedback.feedback = newFeedBack;
    await feedback.save({ session });
    await session.commitTransaction();
    const { deleted, ...feedbacktosend } = feedback.toObject();
    return res
      .status(200)
      .json({ message: "Feedback updated successfully", feedbacktosend });
  } catch (err) {
    await session.abortTransaction();
    return next(
      new HTTPError(
        "Could not update feedback due to internal server error",
        500,
        err
      )
    );
  } finally {
    await session.endSession();
  }
};

module.exports = { createFeedback, updateFeedback };
