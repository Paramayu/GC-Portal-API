const mongoose = require("mongoose");
const mongooseSoftDelete = require("mongoose-delete");

const activitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    dateStarted: { type: Date, required: true },
    dateEnded: { type: Date },
    hourspentperweek: { type: Number, required: true },
    userId: { type: mongoose.Types.ObjectId, required: true, ref: "users" },
    feedbacks: [{ type: mongoose.Types.ObjectId, ref: "feedbacks" }],
  },
  {
    timestamps: true,
  }
);
activitySchema.plugin(mongooseSoftDelete, {
  deletedAt: true, // adds deletedAt timestamp
  overrideMethods: "all", // automatically filters queries like find, findOne
});
const Activity = mongoose.model("activities", activitySchema);
module.exports = Activity;
