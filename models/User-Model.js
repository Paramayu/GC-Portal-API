const mongoose = require("mongoose");
const mongooseSoftDelete = require("mongoose-delete");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    house: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

userSchema.virtual("virtualStudentConnector", {
  ref: "students", // The model to use
  localField: "_id", // Field in B
  foreignField: "userId", // Field in A that references B
});
userSchema.plugin(mongooseSoftDelete, {
  deletedAt: true, // adds deletedAt timestamp
  overrideMethods: "all", // automatically filters queries like find, findOne
});
userSchema.set("toObject", { virtuals: true }); // If you want to see the virtual fields while querying the database after populating so you cant see but access the data
userSchema.set("toJSON", { virtuals: true });
const User = mongoose.model("users", userSchema);
module.exports = User;
