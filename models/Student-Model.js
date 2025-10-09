const mongoose = require("mongoose");
const mongooseSoftDelete = require("mongoose-delete");

const studentSchema = new mongoose.Schema(
  {
    rollno: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 5,
      unique: true,
    },
    grade: { type: Number, required: true, min: 9, max: 14 }, // 13 is for A1 and 14 for A2
    activities: [{ type: mongoose.Schema.Types.ObjectId, ref: "activities" }],
    awards: [{ type: mongoose.Schema.Types.ObjectId, ref: "awards" }],
    universities: [{ type: mongoose.Types.ObjectId, ref: "universities" }],
    userId: { type: mongoose.Types.ObjectId, required: true, ref: "users" },
  },
  {
    timestamps: true,
  }
);
studentSchema.plugin(mongooseSoftDelete, {
  deletedAt: true, // adds deletedAt timestamp
  overrideMethods: "all", // automatically filters queries like find, findOne
});
const Student = mongoose.model("students", studentSchema);
module.exports = Student;
