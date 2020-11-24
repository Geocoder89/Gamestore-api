const mongoose = require("mongoose");

const slugify = require("slugify");
const geocoder = require("../utils/Geocode");
const GamestoreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      unique: true,
      trim: true,
      maxlength: [100, "Name cannot be more than 100 characters"],
    },

    slug: String,
    description: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
      maxlength: [500, "Name cannot be more than 500 characters"],
    },

    website: {
      type: String,
      match: [
        // algorithm to check for the suitability of the website,if it is a match
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        "Please use a valid URL with HTTP or HTTPS",
      ],
    },

    phone: {
      type: String,
      maxlength: [20, "Phone number can not be longer than 20 characters"],
    },
    email: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },

    address: {
      type: String,
      required: [true, "Please add an address"],
    },

    location: {
      // GeoJSON Point
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
        index: "2dsphere",
      },

      // all data coming from the mapquest api and their types
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String,
    },

    categories: {
      type: [String],
      required: true,
      enum: ["Shooter", "Adventure", "Sports", "Strategy"],
    },

    averageRating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [10, "Rating must can not be more than 10"],
    },

    averageSubscription: Number,
    photo: {
      type: String,
      default: "default.jpg",
    },

    moneyBack: {
      type: Boolean,
      default: false,
    },
    topPrized: {
      type: Boolean,
      default: false,
    },
    highestRated: {
      type: Boolean,
      default: false,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },

  // to reverse populate and add a hidden field to our model
  {
    toJSON: { virtuals: true },
    toObject: {
      virtuals: true,
    },
  }
);

// Create Gamestore slug from the name

GamestoreSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Geocode and create location field

GamestoreSchema.pre("save", async function (next) {
  const geolocation = await geocoder.geocode(this.address);
  this.location = {
    type: "Point",
    coordinates: [geolocation[0].longitude, geolocation[0].latitude],
    formattedAddress: geolocation[0].formattedAddress,
    street: geolocation[0].streetName,
    city: geolocation[0].city,
    state: geolocation[0].stateCode,
    country: geolocation[0].countryCode,
    zipcode: geolocation[0].zipcode,
  };

  // do not save address in db

  this.address = undefined;

  next();
});

// Cascade delete Games when a Gamestore is deleted

GamestoreSchema.pre("remove", async function (next) {
  console.log(`Games being removed from Gamestore ${this._id}`);
  await this.model("Games").deleteMany({
    gamestore: this._id,
  });
  next();
});
// reverse populate with virtuals

GamestoreSchema.virtual("games", {
  ref: "Games",
  localField: "_id",
  foreignField: "gamestore",
  justOne: false,
});
module.exports = mongoose.model("Gamestore", GamestoreSchema);
