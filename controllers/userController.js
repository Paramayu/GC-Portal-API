const User = require("../models/User-Model"); // Import the User model
const Student = require("../models/Student-Model");
const HTTPError = require("../util/http-error");
const verifyToken = require("../util/authorization");
const { default: mongoose } = require("mongoose");

const getUserInfo = async (req, res, next) => {
  const verifiedTokenData = verifyToken(req, res);
  if (verifiedTokenData == 0) {
    return;
  }
  const { id, email, role } = verifiedTokenData;
  try {
    //Find the User
    const user = await User.findById(
      role == "gc" && mongoose.Types.ObjectId.isValid(req.params.uid)
        ? req.params.uid
        : id //If there is pid and the role is GC then find the info of the user with id pid else find info of the sending user
    );
    //IF user is not found in DB
    if (!user) {
      res.clearCookie("token");
      return res
        .status(404)
        .json({ message: "There are some problems. Please Login Again" });
    }

    // If the requested info is of the GC, then sending the response for it
    if (role == "gc" && !mongoose.Types.ObjectId.isValid(req.params.uid)) {
      return res.status(200).json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          house: user.house,
        },
      });
    }

    //If it is an student then getting the corrosponding student data
    const student = await Student.findOne({ userId: user.id }).populate([
      {
        path: "activities",
        select: "-__v -userId -deleted -deletedAt -deletedBy",
        populate: {
          path: "feedbacks",
          select: "-__v -userId -deleted -deletedAt -deletedBy",
        },
      },
      { path: "awards", select: "-__v -userId -deleted -deletedAt -deletedBy" },
      {
        path: "universities",
        select: "-__v -userId -deleted -deletedAt -deletedBy",
      },
    ]);

    //If the student model entry is not found
    if (!student) {
      console.log("User Entry Found Student Entry Not Found");
      return res.status(404).json({ message: "User not found" });
    }

    //Tuning the feedbacks of the activities with respect to the GC provider
    if (role == "gc") {
      student.activities = student.activities.map(activity => {
        activity.feedbacks = [
          activity.feedbacks
            .map(feedback => {
              if (feedback.gcId == id) {
                return feedback;
              }
              return null;
            })
            .find(feedback => feedback != null),
        ];
        return activity;
      });
    }
    //Returning the user details
    res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        house: student.house,
        rollno: student.rollno,
        grade: student.grade,
        activities: student.activities,
        awards: student.awards,
        universities: student.universities,
      },
    });
  } catch (error) {
    next(new HTTPError("Could not get user info", 500, error));
  }
};

const getAllUsersAccordingToHouseOfGC = async (req, res, next) => {
  const verifiedTokenData = verifyToken(req, res);
  //Scraps everything if the token data is 0 since there is an error
  if (verifiedTokenData == 0) {
    return;
  }
  const { id, email, role } = verifiedTokenData;
  //If the role is not GC
  if (role !== "gc") {
    return res.status(401).json({ message: "Unauthorized." });
  }
  try {
    const gc = await User.findById(id);
    //IF user is not found in DB
    if (!gc) {
      res.clearCookie("token");
      return res
        .status(404)
        .json({ message: "User not found. Please Login Again" });
    }

    //IF Role in token and role in DB doesnt match
    if (gc.role !== role) {
      res.clearCookie("token");
      return res
        .status(401)
        .json({ message: "Unauthorized. Please Login Again" });
    }

    //Finds the users according to the house and populates corrospinding data from students model using virtualStudentConnector
    const users = await User.find({
      role: "student",
      house: gc.house,
    }).populate("virtualStudentConnector");

    //Sends back the response
    res.status(200).json({
      users: users.map(x => {
        return {
          id: x.id,
          email: x.email,
          name: x.name,
          rollno: x.virtualStudentConnector[0].rollno,
          grade: x.virtualStudentConnector[0].grade,
          house: x.house,
        };
      }),
    });
  } catch (error) {
    next(new HTTPError("Could not get user info", 500, error));
  }
};

module.exports = {
  getUserInfo,
  getAllUsersAccordingToHouseOfGC,
};
