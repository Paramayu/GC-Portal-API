const mongoose = require("mongoose");
const mongooseSoftDelete = require("mongoose-delete");

const awardSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    dateAwarded: { type: Date, required: true },
    gradeWhenAwarded: { type: String, required: true },
    levelOfRecognition: { type: String, required: true },
    awardedBy: { type: String, required: true },
    userId: { type: mongoose.Types.ObjectId, required: true, ref: "users" },
  },
  {
    timestamps: true,
  }
);
awardSchema.plugin(mongooseSoftDelete, {
  deletedAt: true, // adds deletedAt timestamp
  overrideMethods: "all", // automatically filters queries like find, findOne
});
const Award = mongoose.model("awards", awardSchema);
module.exports = Award;
