// custom error handler
const ErrorResponse = require("../utils/errorResponse");

// async error handler
const asyncHandler = require("../middleware/async");

// models
const Games = require("../models/Games");
const Gamestore = require("../models/Gamestores");

// Get Games

//  @desc get all games

// @route GET 'api/v1/games
// @route GET 'api/v1/gamestores/:gamestoreId/games

// @access Public

exports.getGames = asyncHandler(async (req, res, next) => {
  if (req.params.gamestoreId) {
    const games = await Games.find({ gamestore: req.params.gamestoreId });
    return res.status(200).json({
      success: true,
      count: games.length,
      data: games,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// Get Games

//  @desc get single game

// @route GET 'api/v1/game
// @route GET 'api/v1/gamestores/:id

// @access Public

exports.getGame = asyncHandler(async (req, res, next) => {
  const game = await Games.findById(req.params.id).populate();

  if (!game) {
    return next(
      new ErrorResponse(`No Game with the id of ${req.params.id},404`)
    );
  }

  res.status(200).json({
    success: true,
    data: game,
  });
});

// Add Game

//  @desc Add a Game

// @route POST'api/v1/gamestores/gamestoreId/games

// @access Private

exports.createGame = asyncHandler(async (req, res, next) => {
  // submitting the gamestore id into the request

  req.body.gamestore = req.params.gamestoreId;
  req.body.user = req.user.id;

  console.log(req.body.gamestore);

  const gamestore = await Gamestore.findById(req.params.gamestoreId);

  if (!gamestore) {
    return next(
      new ErrorResponse(
        `No Gamestore with the id of ${req.params.gamestoreid},404`
      )
    );
  }

  // check if the user is the gamestore owner

  if (gamestore.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User with ${req.user.id} is not authorized to add a game to gamestore ${gamestore._id}`,
        401
      )
    );
  }

  const game = await Games.create(req.body);

  res.status(200).json({
    success: true,
    data: game,
  });
});

// Update Game

//  @desc Update a Game

// @route PUT'api/v1/games/:id

// @access Private

exports.updateGame = asyncHandler(async (req, res, next) => {
  let game = await Games.findById(req.params.id);

  if (!game) {
    return next(
      new ErrorResponse(`No Game with the id of ${req.params.id},404`)
    );
  }

  // check if the user is the game owner

  if (game.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User with ${req.user.id} is not authorized to delete a game ${game._id} `,
        401
      )
    );
  }

  game = await Games.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: game,
  });
});

// Delete Game

//  @desc Delete a Game

// @route DELETE 'api/v1/games/:id

// @access Private

exports.deleteGame = asyncHandler(async (req, res, next) => {
  const game = await Games.findById(req.params.id);

  if (!game) {
    return next(
      new ErrorResponse(`No Game with the id of ${req.params.id},404`)
    );
  }

  // check if the user is the game owner

  if (game.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User with ${req.user.id} is not authorized to delete game ${game._id} `,
        401
      )
    );
  }

  await Games.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {},
  });
});
