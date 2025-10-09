const mongoose = require("mongoose");
try {
  module.exports = connectionString => {
    mongoose
      .connect(connectionString)
      .then(() => {
        console.log("Mongo connected");
        mongoose.plugin(schema => {
          schema.set("timestamps", true);
        });
      })
      .catch(err => {
        console.log(err);
      });
  };
} catch (e) {
  console.error("Error connecting to MongoDB:", e);
}
