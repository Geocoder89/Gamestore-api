const express = require("express");

const User = require("../models/User");

const {
  createUser,
  deleteUser,
  getUser,
  getUsers,
  updateUser,
} = require("../controllers/users");
const router = express.Router({
  mergeParams: true,
});

// middleware
const advancedResults = require("../middleware/advancedresults");
const { protectRoute, authorize } = require("../middleware/auth");

router.use(protectRoute);
router.use(authorize("admin"));
router.route("/").get(advancedResults(User), getUsers).post(createUser);
router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);
module.exports = router;
