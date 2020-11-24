const express = require("express");

const Game = require("../models/Games");

const advancedResults = require("../middleware/advancedresults");
const {
  getGames,
  getGame,
  createGame,
  updateGame,
  deleteGame,
} = require("../controllers/games");
const router = express.Router({
  mergeParams: true,
});

const { protectRoute, authorize } = require("../middleware/auth");

router
  .route("/")
  .get(
    advancedResults(Game, {
      path: "gamestore",
      select: "name,description",
    }),
    getGames
  )
  .post(protectRoute, authorize("publisher", "admin"), createGame);
router
  .route("/:id")
  .get(getGame)
  .put(protectRoute, authorize("publisher", "admin"), updateGame)
  .delete(protectRoute, authorize("publisher", "admin"), deleteGame);
module.exports = router;
