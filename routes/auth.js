const express = require("express");

const {
  registerUser,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
  logout,
} = require("../controllers/auth");

const router = express.Router();

const { protectRoute } = require("../middleware/auth");
router.post("/register", registerUser);
router.post("/login", login);
router.get("/logout", logout);
router.get("/me", protectRoute, getMe);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resettoken", resetPassword);
router.put("/updatedetails", protectRoute, updateDetails);
router.put("/updatePassword", protectRoute, updatePassword);

module.exports = router;
