const jwt = require("jsonwebtoken");

const async = require("./async");

const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");
const asyncHandler = require("./async");

// middleware to protect routes

exports.protectRoute = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // extract the token using the split method
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  // make sure token exists

  if (!token) {
    return next(new ErrorResponse(`Not Authorized to access this route`, 401));
  }

  try {
    // verify token

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    console.log(decodedToken);

    req.user = await User.findById(decodedToken.id);

    next();
  } catch (error) {
    return next(new ErrorResponse(`Not Authorized to access this route`, 401));
  }
});

// Grant access to specific roles

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User with role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};
