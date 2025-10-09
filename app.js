const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const mongooseConnect = require("./util/Mongoose-Connect");
const indexRoutes = require("./routes/indexRoute");
const errorHandler = require("./controllers/errorController");

const app = express();

const connectionString =
  "mongodb+srv://paramayu:HRE8x52nfRRQr1gC@test.3uflnaa.mongodb.net/gc?retryWrites=true&w=majority&appName=TEST";
mongooseConnect(connectionString);

// Middleware to parse JSON
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "localhost",
  })
);
app.use(bodyParser.json());
app.use("/api", indexRoutes);

//Global Error Handeler Triggered when an argument is passed to the next() function
app.use(errorHandler);

// Start the server
const PORT = 9000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
