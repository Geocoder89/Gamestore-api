const fs = require("fs");

const mongoose = require("mongoose");

const colors = require("colors");
const dotenv = require("dotenv");

// load environmental variables

dotenv.config({
  path: "./config/config.env",
});

// Load Models

const Gamestore = require("./models/Gamestore");

const Games = require("./models/Games");

const User = require("./models/User");
const Review = require("./models/Review");

// connect to db

mongoose.connect(process.env.MONGODB_URI, {
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useNewUrlParser: true,
});

// Read JSON Files

const gamestores = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/Gamestores.json`, "utf-8")
);

const games = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/Games.json`, "utf-8")
);

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/users.json`, "utf-8")
);

const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/reviews.json`, "utf-8")
);
//function to import into db

const importData = async () => {
  try {
    await Gamestore.create(gamestores);
    await Games.create(games);
    await User.create(users);
    await Review.create(reviews);

    console.log(`Data Imported...`.green.inverse);

    process.exit();
  } catch (error) {
    console.error(error);
  }
};

// Delete data from db

const deleteData = async () => {
  try {
    await Gamestore.deleteMany();
    await Games.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log(`Data destroyed.....`.red.inverse);
    process.exit();
  } catch (error) {
    console.error(err);
  }
};

if (process.argv[2] === "import") {
  importData();
} else if (process.argv[2] === "delete") {
  deleteData();
}
