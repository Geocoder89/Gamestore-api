const mongoose = require("mongoose");

const GameSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true, //to remove unnecessary white spaces
    required: ["Please add a game title"],
  },
  description: {
    type: String,
    required: [true, "Please add a description"],
  },

  releaseDate: {
    type: Number,
    required: [true, "Please add the release Date of Game"],
  },

  price: {
    type: Number,
    required: [true, "Please add a Game price"],
  },
  minimumSkill: {
    type: String,
    required: [true, "Please add the minimum skill of the game"],
    enum: ["recruit", "beginner", "intermediate", "advanced"], //possible values that this field can only contain
  },
  moneyBackGuarantee: {
    type: Boolean,
    default: false,
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

// static method to get the average subscription for a game store
GameSchema.statics.getAverageSubscription = async function (gameStoreId) {
  const obj = await this.aggregate([
    {
      $match: { gamestore: gameStoreId },
    },
    {
      $group: {
        _id: "$gamestore",
        averageSubscription: { $avg: "$price" },
      },
    },
  ]);
  try {
    await this.model("Gamestore").findByIdAndUpdate(gameStoreId, {
      averageSubscription: Math.ceil(obj[0].averageSubscription / 10) * 10,
    });
  } catch (error) {
    console.error(error);
  }
};

// Call getAverageSubscription after save

GameSchema.post("save", function () {
  this.constructor.getAverageSubscription(this.gamestore);
});

// Calculate getAverageSubscription when removed
GameSchema.pre("remove", function () {
  this.constructor.getAverageSubscription(this.gamestore);
});
module.exports = mongoose.model("Games", GameSchema);
