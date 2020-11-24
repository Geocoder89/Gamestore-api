const crypto = require("crypto");
const mongoose = require("mongoose");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
  },

  email: {
    type: String,
    required: [true, "please add an email address"],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
  },

  role: {
    type: String,
    enum: ["user", "publisher"],
    default: "user",
  },

  password: {
    type: String,
    required: [true, "Please enter your password"],
    minlength: 6,
    // this hides the password
    select: false,
  },
  resetPasswordToken: String,
  resetPasswordExpirationDate: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrpyt password using bcrpytjs

UserSchema.pre("save", async function (next) {
  // if the password is not modified we move to hashing a new password
  if (!this.isModified("password")) {
    next();
  }
  // to generate the salt
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return

UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    {
      id: this._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE,
    }
  );
};

// match user entered password to hashed Password in database

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token

UserSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // hash token and set to resetPasswordToken field

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // set expires field

  this.resetPasswordExpirationDate = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model("User", UserSchema);
