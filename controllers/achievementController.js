const Activity = require("../models/Activity-Model");
const Award = require("../models/Award-Model");
const University = require("../models/University-Model");
const Feedback = require("../models/Feedback-Model");
const verifyToken = require("../util/authorization");
const { default: mongoose } = require("mongoose");
const User = require("../models/User-Model");
const Student = require("../models/Student-Model");
const HTTPError = require("../util/http-error");
const { validateFields } = require("../util/validators");
const session = require("express-session");

// const createActivity = async (req, res) => {
//   const verifiedTokenData = verifyToken(req, res);
//   //Check if the token is valid or not if not return;
//   if (verifiedTokenData == 0) {
//     return;
//   }
//   const { id, email, role } = verifiedTokenData;
//   if (role == "gc") {
//     return res.status(401).json({ error: "Unauthorized." });
//   }

//   try {
//     if (!(await User.exists({ _id: id }))) {
//       res.clearCookie("token");
//       return res
//         .status(404)
//         .json({ error: "Authentication Error. Please Login Again" });
//     }
//     const {
//       title,
//       description,
//       dateStarted,
//       dateEnded = null,
//       hourspentperweek,
//     } = req.body;

//     if (!title || !description || !dateStarted || !hourspentperweek) {
//       return res
//         .status(400)
//         .json({ error: "Bad Request. Incomplete Data Provided" });
//     }
//     const activityTemplate = {
//       title: title,
//       description: description,
//       dateStarted: new Date(dateStarted),
//       dateEnded: dateEnded ? new Date(dateEnded) : null,
//       hourspentperweek,
//       userId: id,
//       feedbacks: [],
//     };
//     //Create New Activity
//     const activity = new Activity(activityTemplate);
//     await activity.save();
//     return res.status(200).json({ message: "Activity Added", activity });
//   } catch (err) {
//     return new HTTPError(
//       "Could not create activity due to internal server error",
//       500,
//       err
//     );
//   }
// };
const createAchievement = async (req, res) => {
  const verifiedTokenData = verifyToken(req, res);
  const typeOfData = req.originalUrl.split("/")[2];

  const requiredData = {
    activity: [
      "title",
      "description",
      "dateStarted",
      "hourspentperweek",
      "dateEnded",
    ],
    university: [
      "name",
      "country",
      "program",
      "dateOfApplication",
      "applicationSession",
      "attendingYear",
    ],
    award: [
      "title",
      "description",
      "dateAwarded",
      "gradeWhenAwarded",
      "levelOfRecognition",
      "awardedBy",
    ],
  }[typeOfData];
  const AchievementModel =
    typeOfData == "activity"
      ? Activity
      : typeOfData == "award"
      ? Award
      : University;

  //Check if the token is valid or not if not return;
  if (verifiedTokenData == 0) {
    return;
  }
  const { id, email, role } = verifiedTokenData;
  if (role == "gc") {
    return res.status(401).json({ error: "Unauthorized." });
  }
  //Start mongoose session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    //Find the student with userid and check if it exists or not
    const student = await Student.findOne({ userId: id });
    if (!student) {
      res.clearCookie("token");
      return res
        .status(404)
        .json({ error: "Authentication Error. Please Login Again" });
    }

    //Validate all the incoming fields
    const validationResult = validateFields({ ...req.body });
    if (validationResult.length > 0) {
      return res.status(499).json({ error: validationResult });
    }

    //Create the data in form of modal template
    let achievementTemplate = { userId: id };
    requiredData.forEach(data => {
      if (!req.body[data] && data != "dateEnded") {
        return res
          .status(400)
          .json({ error: "Bad Request. Incomplete Data Provided" });
      }
      achievementTemplate[data] = req.body[data];
    });

    //Create New Achievement
    const achievement = new AchievementModel(achievementTemplate);
    //Save new Achivement
    await achievement.save({ session });
    //Save achievement in student data too
    student[
      typeOfData == "activity"
        ? "activities"
        : typeOfData == "university"
        ? "universities"
        : "awards"
    ].push(achievement.id);
    //Save all changes
    await student.save({ session });
    await session.commitTransaction();
    const { deleted, ...achievementtosend } = achievement.toObject();
    //Send response
    res.status(200).json({
      message: `Succesfully Created ${typeOfData}`,
      achievementtosend,
    });
    return;
  } catch (err) {
    await session.abortTransaction();
    return new HTTPError(
      `Could not create ${typeOfData} due to internal server error`,
      500,
      err
    );
  } finally {
    await session.endSession();
  }
};

const updateAchievement = async (req, res, next) => {
  const typeOfData = req.originalUrl.split("/")[2];
  const verifiedTokenData = verifyToken(req, res);
  //Check if the token is valid or not if not return;
  if (verifiedTokenData == 0) {
    return;
  }
  const { id: userId, email, role } = verifiedTokenData;
  if (role == "gc") {
    return res.status(401).json({ error: "Unauthorized." });
  }

  try {
    if (!(await User.exists({ _id: userId }))) {
      res.clearCookie("token");
      return res
        .status(404)
        .json({ error: "Authentication Error. Please Login Again" });
    }

    const achievementId = req.params.id;
    const AchievementModel =
      typeOfData == "activity"
        ? Activity
        : typeOfData == "award"
        ? Award
        : University;
    let achievement = await AchievementModel.findById(achievementId);
    if (!achievement) {
      return res.status(404).json({ error: "Activity not found" });
    }
    console.log(achievement);
    if (achievement.userId != userId) {
      return res.status(401).json({ error: "Unauthorized." });
    }
    const allowedUpdateFields = {
      activity: [
        "title",
        "description",
        "dateStarted",
        "dateEnded",
        "hourspentperweek",
      ],
      award: [
        "title",
        "description",
        "dateAwarded",
        "gradeWhenAwarded",
        "levelOfRecognition",
        "awardedBy",
      ],
      university: [
        "name",
        "country",
        "program",
        "dateOfApplication",
        "applicationSession",
        "attendingYear",
      ],
    }[typeOfData];
    const validationResult = validateFields({ ...req.body });
    if (validationResult.length > 0) {
      return res.status(400).json({ error: validationResult });
    }
    Object.keys(req.body).forEach(key => {
      if (allowedUpdateFields.includes(key)) {
        achievement[key] = req.body[key];
      }
    });
    await achievement.save();
    const { deleted, ...achievementtosend } = achievement.toObject();
    return res
      .status(200)
      .json({ message: `Updared ${typeOfData}`, achievementtosend });
  } catch (err) {
    return new HTTPError(
      `Could not update ${typeOfData} due to internal server error`,
      500,
      err
    );
  }
};

const deleteOrRestoreAchievement = async (req, res) => {
  const typeOfData = req.originalUrl.split("/")[2];
  const AchievementModel =
    typeOfData == "activity"
      ? Activity
      : typeOfData == "award"
      ? Award
      : University;
  const verifiedTokenData = verifyToken(req, res);
  //Check if the token is valid or not if not return;
  if (verifiedTokenData == 0) {
    return;
  }
  if (verifiedTokenData.role == "gc") {
    return res.status(401).json({ error: "Unauthorized." });
  }
  const { id: userId } = verifiedTokenData;
  const id = req.params.id;
  const session = await mongoose.startSession();
  //Checks if deleted or non deleted achievement is to be found and then finds it
  try {
    const achievement =
      req.method == "PATCH"
        ? await AchievementModel.findOneDeleted({ _id: id })
        : await AchievementModel.findById(id);
    if (!achievement) {
      return res.status(404).json({ error: "Achivement not found" });
    }
    console.log(achievement.userId == userId);
    console.log(achievement.userId, userId);
    if (achievement.userId != userId) {
      return res.status(401).json({ error: "Unauthorized." });
    }
    session.startTransaction();
    //Checks what operation is to be done and does it
    if (req.method == "PATCH") {
      await achievement.restore({ session });
    } else {
      await achievement.delete({ session });
    }
    res.status(200).json({
      // Gives response according to the method used or operation done
      message: `${typeOfData} ${
        req.method == "PATCH" ? "restored" : "deleted"
      } successfully`,
    });
    await session.commitTransaction();
    await session.endSession();
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return new HTTPError(
      `Could not ${
        req.method == "PATCH" ? "restore" : "delete"
      } ${typeOfData} due to internal server error`,
      500,
      err
    );
  }
};

module.exports = {
  deleteOrRestoreAchievement,
  createAchievement,
  updateAchievement,
};
