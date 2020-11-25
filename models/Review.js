const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Please add a title for the review"],
    maxlength: 100,
  },
  text: {
    type: String,
    required: [true, "Please add some text"],
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, "Please add a rating between 1 and 10"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  gamestore: {
    type: mongoose.Schema.ObjectId,
    ref: "Gamestore",
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
});

// enforces that a user only makes one review per gamestore and not multiple reviews on a gamestore.
ReviewSchema.index(
  {
    gamestore: 1,
    user: 1,
  },
  { unique: true }
);

// static method to get the average rating for a game store

// Static method to get avg rating and save
ReviewSchema.statics.getAverageRating = async function (gamestoreId) {
  const obj = await this.aggregate([
    {
      $match: { gamestore: gamestoreId },
    },
    {
      $group: {
        _id: "$gamestore",
        averageRating: { $avg: "$rating" },
      },
    },
  ]);

  try {
    await this.model("Gamestore").findByIdAndUpdate(gamestoreId, {
      averageRating: obj[0].averageRating,
    });
  } catch (err) {
    console.error(err);
  }
};
// Call getAverageRatings after save

ReviewSchema.post("save", async function () {
  await this.constructor.getAverageRating(this.gamestore);
});

// Calculate getAverageSubscription when removed
ReviewSchema.post("remove", async function () {
  await this.constructor.getAverageRating(this.gamestore);
});
module.exports = mongoose.model("Review", ReviewSchema);
