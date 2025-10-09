const mongoose = require("mongoose");
const mongooseSoftDelete = require("mongoose-delete");

const feedbackSchema = new mongoose.Schema(
  {
    feedback: { type: String, required: true },
    studentId: { type: mongoose.Types.ObjectId, required: true, ref: "users" },
    gcId: { type: mongoose.Types.ObjectId, required: true, ref: "users" },
  },
  {
    timestamps: true,
  }
);
feedbackSchema.plugin(mongooseSoftDelete, {
  deletedAt: true, // adds deletedAt timestamp
  overrideMethods: "all", // automatically filters queries like find, findOne
});
const Feedback = mongoose.model("feedbacks", feedbackSchema);
module.exports = Feedback;
