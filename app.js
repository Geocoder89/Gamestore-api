const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");
const errorHandler = require("./middleware/errorhandler");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");

dotenv.config({ path: "./config/config.env" });

// mongoose set up

connectDB();

//  Route files

const gamestores = require("./routes/gamestores");
const games = require("./routes/games");
const auth = require("./routes/auth");
const users = require("./routes/users");

const app = express();

// Body Parser middleware to parse req.body data

app.use(express.json());

// cookie parser middleware

app.use(cookieParser());

// Dev logging middleware

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(fileUpload());

// set static

app.use(express.static(path.join(__dirname, "public")));

// mount routes

app.use("/api/v1/gamestores", gamestores);
app.use("/api/v1/games", games);
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", users);

// error handling function
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `Server is listening in ${process.env.NODE_ENV} mode on port  ${PORT}`.blue
      .bold
  );
});

// handle unhandled promise rejections

process.on("unhandledRejection", (err, promise) => {
  console.log(`Error:${err.message}`.red);

  // close server and exit process

  // server.close(() => process.exit(1));
});
