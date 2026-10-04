const express = require("express");
const router = express.Router();
const { addRating, getUserRatings } = require("../controllers/ratingController");
const { protect } = require("../middleware/authMiddleware");

// @route add your rating for a ride 
router.post("/add", protect, addRating);

// @route GET  USER RATINGS
router.get("/user/:userId", protect, getUserRatings);

module.exports = router;