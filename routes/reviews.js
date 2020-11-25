const express = require("express");

const Review = require("../models/Review");

const {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview,
} = require("../controllers/reviews");

const advancedResults = require("../middleware/advancedresults");
const { protectRoute, authorize } = require("../middleware/auth");

const router = express.Router({
  mergeParams: true,
});
router
  .route("/")
  .get(
    advancedResults(Review, {
      path: "gamestore",
      select: "name description",
    }),
    getReviews
  )
  .post(protectRoute, authorize("user", "admin"), addReview);

router
  .route("/:id")
  .get(getReview)
  .put(protectRoute, authorize("user", "admin"), updateReview)
  .delete(protectRoute, authorize("user", "admin"), deleteReview);
module.exports = router;
