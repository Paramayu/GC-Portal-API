const mongoose = require("mongoose");
const mongooseSoftDelete = require("mongoose-delete");

const universitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    country: { type: String, required: true },
    program: { type: String, required: true },
    dateOfApplication: { type: Date, required: true },
    applicationSession: { type: String, required: true },
    attendingYear: { type: Date, required: true },
    userId: { type: mongoose.Types.ObjectId, required: true, ref: "users" },
  },
  {
    timestamps: true,
  }
);
universitySchema.plugin(mongooseSoftDelete, {
  deletedAt: true, // adds deletedAt timestamp
  overrideMethods: "all", // automatically filters queries like find, findOne
});
const University = mongoose.model("universities", universitySchema);
module.exports = University;
