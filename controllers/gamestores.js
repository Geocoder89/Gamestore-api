const path = require("path");
const ErrorResponse = require("../utils/errorResponse");
const geocoder = require("../utils/Geocode");
const Gamestore = require("../models/Gamestore");

const asyncHandler = require("../middleware/async");

//  @desc get all gamestores

// @route GET 'api/v1/gamestores

// @access Public
exports.getGamestores = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

//  @desc get single gamestore

// @route GET 'api/v1/gamestore/:id

// @access Public

exports.getGamestore = asyncHandler(async (req, res, next) => {
  const gamestore = await Gamestore.findById(req.params.id);

  // to check if the gamestore is correctly formatted but does not exist in the database.
  if (!gamestore) {
    return next(
      new ErrorResponse(`Gamestore not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: gamestore,
  });
});

//  @desc Create a gamestore

// @route POST'api/v1/gamestores

// @access Private

exports.createGameStore = asyncHandler(async (req, res, next) => {
  // Add user to body

  req.body.user = req.user.id;

  // check for published gamestores

  const publishedGamestore = await Gamestore.findOne({
    user: req.user.id,
  });

  // if the user is not an admin,they can only add one bootcamp

  if (publishedGamestore && req.user.role != "admin") {
    return next(
      new ErrorResponse(
        `The user with ID ${req.user.id} has already published a gamestore`,
        400
      )
    );
  }
  const gamestore = await Gamestore.create(req.body);
  res.status(201).json({
    success: true,
    data: gamestore,
    message: "Gamestore successfully created",
  });
});

//  @desc Update a gamestore

// @route PUT 'api/v1/gamestore/:id

// @access Private

exports.updateGameStore = asyncHandler(async (req, res, next) => {
  let gamestore = await Gamestore.findById(req.params.id);

  if (!gamestore) {
    return next(
      new ErrorResponse(`Gamestore not found with id of ${req.params.id}`, 404)
    );
  }

  // make user owns the gamestore or is the gamestore owner

  if (gamestore.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User with ${req.params.id} is not authorized to update this Gamestore`,
        401
      )
    );
  }

  gamestore = await Gamestore.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: gamestore,
  });
});
//  @desc Delete a gamestore

// @route DELETE 'api/v1/gamestore/:id

// @access Private

exports.deleteGameStore = asyncHandler(async (req, res, next) => {
  const gamestore = await Gamestore.findById(req.params.id);

  // check if the gamestore exists
  if (!gamestore) {
    return next(
      new ErrorResponse(`Gamestore not found with id of ${req.params.id}`, 404)
    );
  }

  // make user owns the gamestore or is the gamestore owner

  if (gamestore.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User with ${req.params.id} is not authorized to delete this Gamestore`,
        401
      )
    );
  }

  gamestore.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc Get bootcamps within a radius

// @route GET /api/v1/bootcamps/radius/:zipcode/:distance

exports.getGamestoreByRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // Get latitude and longitude from geocoder

  const location = await geocoder.geocode(zipcode);
  const latitude = location[0].latitude;
  const longitude = location[0].longitude;

  // calculate radius using radians

  // Divide the distance by the radius of the earth

  // Earth Radius = 6,378km

  const radius = distance / 6378;

  const gamestores = await Gamestore.find({
    location: {
      $geoWithin: { $centerSphere: [[longitude, latitude], radius] },
    },
  });

  res.status(200).json({
    success: true,
    count: gamestores.length,
    data: gamestores,
  });
});

//  @desc Upload bootcamp photo

// @route PUT 'api/v1/gamestore/:id/photo

// @access Private

exports.gamestorePhotoUpload = asyncHandler(async (req, res, next) => {
  const gamestore = await Gamestore.findById(req.params.id);

  if (!gamestore) {
    return next(
      new ErrorResponse(`Gamestore not found with id of ${req.params.id}`, 404)
    );
  }

  // check if current user is the bootcamp owner

  if (gamestore.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User with ${req.params.id} is not authorized to update this Gamestore`,
        401
      )
    );
  }

  // check if file was uploaded

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.File;

  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // to set or check a file size

  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image of less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  // create custom filename

  file.name = `photo_${gamestore._id}${path.parse(file.name).ext}`;

  // to move the files

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);

      return next(new ErrorResponse(`Problem with file Upload`, 500));
    }
    await Gamestore.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});
