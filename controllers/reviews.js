// custom error handler
const ErrorResponse = require("../utils/errorResponse");

// async error handler
const asyncHandler = require("../middleware/async");

// models
const Review = require("../models/Review");
const Gamestore = require("../models/Gamestore");

// Get Reviews

//  @desc get all Reviews

// @route GET 'api/v1/reviews
// @route GET 'api/v1/gamestores/:gamestoreId/reviews

// @access Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.gamestoreId) {
    const reviews = await Review.find({ gamestore: req.params.gamestoreId });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

//  @desc  Get a single review

// @route GET 'api/v1/reviews/:id

// @access Public

exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: "gamestore",
    select: "name description",
  });

  if (!review) {
    return next(
      new ErrorResponse(`No review found with the id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: review,
  });
});

//  @desc  Add a single review

// @route POST 'api/v1/gamestores/gamestoreId/review

// @access Private

exports.addReview = asyncHandler(async (req, res, next) => {
  // we append the gamestore and user to what comes from the request body for the review
  req.body.gamestore = req.params.gamestoreId;
  req.body.user = req.user.id;

  //   we check to see if the gamestore exists,
  const gamestore = await Gamestore.findById(req.params.gamestoreId);

  //   if not we throw an error message.
  if (!gamestore) {
    return next(
      new ErrorResponse(`No gamestore with the id of ${req.params.gamestoreId}`)
    );
  }

  //   else we create a review for the gamestore

  const review = await Review.create(req.body);

  res.status(201).json({
    success: true,
    data: review,
  });
});

//  @desc  Update single review

// @route PUT 'api/v1/reviews/:id

// @access Private

exports.updateReview = asyncHandler(async (req, res, next) => {
  //  we find the review by it's id
  let review = await Review.findById(req.params.id);

  //   if not we throw an error message.
  if (!review) {
    return next(
      new ErrorResponse(`No review with the id of ${req.params.id}`, 404)
    );
  }

  // check if the id belongs to a user unless the user is an admin

  if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse(`Not authorized to update review `, 401));
  }

  //   else we create a review for the gamestore

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: review,
  });
});

//  @desc  Delete a single review

// @route DELETE 'api/v1/reviews/:id

// @access Private

exports.deleteReview = asyncHandler(async (req, res, next) => {
  //  we find the review by it's id
  const review = await Review.findById(req.params.id);

  //   if not we throw an error message.
  if (!review) {
    return next(
      new ErrorResponse(`No review with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure review belongs to user or user is admin
  if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse(`Not authorized to update review`, 401));
  }

  //   else we delete a review for the gamestore

  await review.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});
