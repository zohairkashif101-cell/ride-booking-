const Rating = require("../models/Rating");
const Ride = require("../models/Ride");

// Add Rating
const addRating = async (req, res) => {
  try {
    const { rideId, toUserId, rating, comment } = req.body;

    // Check required fields
    if (!rideId || !toUserId || !rating) {
      return res.status(400).json({
        message: "Ride ID, user ID and rating are required",
      });
    }

    // Check if ride exists
    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({
        message: "Ride not found",
      });
    }

    // Rating only after ride completion
    if (ride.status !== "completed") {
      return res.status(400).json({
        message: "You can only rate after ride completion",
      });
    }

    const userId = req.user?._id?.toString() || req.user?.userId?.toString();

    // Check if user is part of this ride
    const isPassenger =
      ride.passenger && ride.passenger.toString() === userId;

    const isDriver =
      ride.driver && ride.driver.toString() === userId;

    if (!isPassenger && !isDriver) {
      return res.status(403).json({
        message: "You are not part of this ride",
      });
    }

    // Check rating value
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    // User cannot rate themselves
    if (toUserId.toString() === userId) {
      return res.status(400).json({
        message: "You cannot rate yourself",
      });
    }

    // Check if target user is actually part of the ride
    const isTargetPassenger =
      ride.passenger && ride.passenger.toString() === toUserId.toString();

    const isTargetDriver =
      ride.driver && ride.driver.toString() === toUserId.toString();

    if (!isTargetPassenger && !isTargetDriver) {
      return res.status(400).json({
        message: "Target user is not part of this ride",
      });
    }

    // Check if rating already exists
    const existingRating = await Rating.findOne({
      ride: rideId,
      fromUser: userId,
    });

    if (existingRating) {
      return res.status(400).json({
        message: "You have already rated this ride",
      });
    }

    // Create rating
    const newRating = await Rating.create({
      ride: rideId,
      fromUser: userId,
      toUser: toUserId,
      rating,
      comment,
    });

    res.status(201).json({
      message: "Rating added successfully",
      rating: newRating,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add rating",
      error: error.message,
    });
  }
};

// Get User Ratings
const getUserRatings = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find ratings received by user
    const ratings = await Rating.find({
      toUser: userId,
    })
      .populate("fromUser", "fullname email")
      .populate("toUser", "fullname email")
      .populate("ride");

    res.status(200).json({
      count: ratings.length,
      ratings,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get user ratings",
      error: error.message,
    });
  }
};

module.exports = {
  addRating,
  getUserRatings,
};