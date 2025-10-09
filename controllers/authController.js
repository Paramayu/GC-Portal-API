const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User-Model"); // Import the User model

const sendOTPEmail = require("../util/sendEmail");
const redisClient = require("../util/redisClient");
const Student = require("../models/Student-Model");
const crypto = require("crypto");
const { default: mongoose } = require("mongoose");
const HttpError = require("../util/http-error");
const { validateFields } = require("../util/validators");
const jwtkey = process.env.JWT_KEY;

const registerUser = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { name, email, password, house, rollno, grade, otp } = req.body;
    //Validate all the incoming fields on their structure and things
    if (!name)
      return res.status(400).json({ error: "Bad Request. Name required" });
    {
      const errors = validateFields({ email, password, house, rollno, grade });
      if (errors.length > 0) {
        return res.status(499).json({ errors });
      }
    }
    //Check if email already exists
    {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "Email is already in use." });
      }
    }
    //Check if the OTP Matches
    {
      if (!otp) return res.status(400).json({ error: "OTP required" });

      const storedOTP = await redisClient.get(`otp:${email}`);
      if (!storedOTP)
        return res.status(400).json({ error: "OTP expired or not found" });

      if (storedOTP !== otp)
        return res.status(400).json({ error: "Invalid OTP" });

      // Success: delete OTP so it can’t be reused
      await redisClient.del(`otp:${email}`);
    }
    //Main Registering Logic
    {
      const hashedpassword = await bcrypt.hash(password, 12);
      const user = new User({
        name,
        email,
        password: hashedpassword,
        role: "student",
        house,
      });
      const createdUser = await user.save({ session });
      const student = new Student({
        rollno,
        grade,
        activities: [],
        awards: [],
        universities: [],
        userId: createdUser.id,
      });
      await student.save({ session });
      const token = jwt.sign(
        { id: createdUser.id, email, role: "student" },
        jwtkey
      );
      res.cookie("token", token);
      res.status(201).json({
        message: "User Created",
        createdUser: {
          id: createdUser.id,
          name,
          email,
          role: "student",
          house,
          rollno,
          grade,
        },
      });
      await session.commitTransaction();
      session.endSession();
    }
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(
      new HttpError(
        "Could not register user due to internal server error",
        500,
        error
      )
    ); // Pass errors to the error-handling middleware
  }
};
const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  const validatedFields = validateFields({ email, password });
  if (validatedFields.length > 0) {
    return res.status(499).json({ errors: validatedFields });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res
        .status(404)
        .json({ message: "User with given email does not exist." });
    }
    if (!(await bcrypt.compare(password, existingUser.password))) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }
    const jwttoken = jwt.sign(
      { id: existingUser.id, email, role: existingUser.role },
      jwtkey
    );
    res.cookie("token", jwttoken);
    res.status(200).json({ message: "Logged in Successfully" });
  } catch (err) {
    next(
      new HttpError("Could not login due to internal server error", 500, err)
    );
  }
};

const logoutUser = (req, res, next) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Successfully Logged Out" });
};

const sendOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });
  {
    //Validate the email
    const errors = validateFields({ email });
    if (errors.length > 0) {
      return res.status(499).json({ errors });
    }
  }
  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    return res
      .status(409)
      .json({ message: "User with given email already exist." });
  }
  const otp = crypto.randomInt(100000, 999999).toString();
  const ttl = 10 * 60; // 10 minutes in seconds

  // Store in Redis: key = otp:<email>
  await redisClient.set(`otp:${email}`, otp, { EX: ttl });

  // TODO: send email here using nodemailer or similar
  const response = await sendOTPEmail(email, otp);
  if (response === 0) {
    next(new HttpError("Could not send OTP due to internal server error", 500));
  }
  console.log(`OTP for ${email} is ${otp}`);

  res.status(200).json({ message: "OTP sent successfully!" });
};
module.exports = { registerUser, sendOTP, loginUser, logoutUser };
