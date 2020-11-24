const crypto = require("crypto");

const ErrorResponse = require("../utils/errorResponse");

const asyncHandler = require("../middleware/async");

const sendEmail = require("../utils/sendemail");

const User = require("../models/User");

//  @desc Register User

// @route POST 'api/v1/auth/register

// @access Public

exports.registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // create user

  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  //   set cookie
  sendTokenResponse(user, 200, res);
});

//  @desc Login User

// @route POST 'api/v1/auth/login

// @access Public

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // validate email and password

  if (!email || !password) {
    return next(
      new ErrorResponse("Please provide a valid email and password", 400)
    );
  }

  // check for user

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  // check if password matches

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  //   set cookie
  sendTokenResponse(user, 200, res);
});

//  @desc Forgot Password

// @route POST 'api/v1/auth/forgotpassword

// @access Private

// @desc      Forgot password
// @route     POST /api/v1/auth/forgotpassword
// @access    Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse("There is no user with that email", 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset token",
      message,
    });

    res.status(200).json({ success: true, data: "Email sent" });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpirationDate = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse("Email could not be sent", 500));
  }
});

//  @Gdesc Reset Password
// @route PUT 'api/v1/auth/resetpassword/:resetToken

// @access Public

exports.resetPassword = asyncHandler(async (req, res, next) => {
  //  Get hashed Token

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    // this is to check if the expiration date is greater than present time.
    resetPasswordExpirationDate: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse(`Invalid Token`, 400));
  }

  // if user exists set new password

  user.password = req.body.password;

  // we then set the resetPasswordToken and expiration date to undefined values

  user.resetPasswordToken = undefined;
  user.resetPasswordExpirationDate = undefined;

  // we resave the user

  await user.save();

  //  we then send a token response with the token and cookie

  sendTokenResponse(user, 200, res);
});

//  @Get loggedinUser

// @route POST 'api/v1/auth/me

// @access Private

exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

//  @desc update user details

// @route PUT 'api/v1/auth/updatedetails

// @access Private

exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };
  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

//  @desc update user password

// @route PUT 'api/v1/auth/updatepassword

// @access Private

exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  // check current password

  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse(`Password is incorrect`, 401));
  }

  user.password = req.body.newPassword;

  await user.save();

  sendTokenResponse(user, 200, res);
});

// helper function to get token from model ,create cookie and send response

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
  });
};
