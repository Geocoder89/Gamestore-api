const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const morgan = require("morgan");
const sanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");
const xss = require("xss-clean");
const helmet = require("helmet");
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
const reviews = require("./routes/reviews");

const app = express();

// Body Parser middleware to parse req.body data

app.use(express.json());

// cookie parser middleware

app.use(cookieParser());

// Dev logging middleware

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// File upload
app.use(fileUpload());

// Sanitize data

app.use(sanitize());

// Set Security headers

app.use(helmet());

// Prevnt XSS attacks

app.use(xss());

// Rate Limiting

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, //10mins
  max: 100,
});

app.use(limiter);

// preventing Http param pollution

app.use(hpp());

// Enable CORS to allow apps on another domain access our app

app.use(cors());

// set static

app.use(express.static(path.join(__dirname, "public")));

// mount routes

app.use("/api/v1/gamestores", gamestores);
app.use("/api/v1/games", games);
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", users);
app.use("/api/v1/reviews", reviews);

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
