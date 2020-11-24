const express = require("express");
const {
  getGamestore,
  getGamestores,
  updateGameStore,
  createGameStore,
  deleteGameStore,
  getGamestoreByRadius,
  gamestorePhotoUpload,
} = require("../controllers/gamestores");

// include other resource router

const gamesRouter = require("./games");

const router = express.Router();

const { protectRoute, authorize } = require("../middleware/auth");

// Re-route into other resource router

router.use("/:gamestoreId/games", gamesRouter);

const advancedResults = require("../middleware/advancedresults");

const Gamestore = require("../models/Gamestores");

router.route("/radius/:zipcode/:distance").get(getGamestoreByRadius);

router
  .route("/")
  .get(advancedResults(Gamestore, "games"), getGamestores)
  .post(protectRoute, authorize("publisher", "admin"), createGameStore);

router
  .route("/:id")
  .get(getGamestore)
  .put(protectRoute, authorize("publisher", "admin"), updateGameStore)
  .delete(protectRoute, authorize("publisher", "admin"), deleteGameStore);

router
  .route("/:id/photo")
  .put(protectRoute, authorize("publisher", "admin"), gamestorePhotoUpload);

module.exports = router;
