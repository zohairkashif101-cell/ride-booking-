const Ride = require("../models/Ride");

// Book / Create Ride
const createRide = async (req, res) => {
  try {
    const { pickup, destination, fare } = req.body;

    if (!pickup || !destination) {
      return res.status(400).json({
        message: "Pickup and destination are required",
      });
    }

    const ride = await Ride.create({
      passenger: req.user.userId,
      pickup,
      destination,
      fare: fare || 0,
    });

    res.status(201).json({
      message: "Ride booked successfully",
      ride,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to book ride",
      error: error.message,
    });
  }
};


// Get Single Ride
const getRideById = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate("passenger", "name email role")
      .populate("driver", "name email role");

    if (!ride) {
      return res.status(404).json({
        message: "Ride not found",
      });
    }

    res.status(200).json({
      ride,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get ride",
      error: error.message,
    });
  }
};


// Update Ride Status
const updateRideStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "accepted",
      "started",
      "completed",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid ride status",
      });
    }

    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({
        message: "Ride not found",
      });
    }

    // Accept ride
    if (status === "accepted") {
      if (ride.status !== "requested") {
        return res.status(400).json({
          message: "Ride cannot be accepted",
        });
      }

      if (req.user.role !== "driver") {
        return res.status(403).json({
          message: "Only a driver can accept a ride",
        });
      }

      ride.driver = req.user.userId;
    }

    // Start ride
    if (status === "started") {
      if (ride.status !== "accepted") {
        return res.status(400).json({
          message: "Ride cannot be started",
        });
      }

      if (
        !ride.driver ||
        ride.driver.toString() !== req.user.userId
      ) {
        return res.status(403).json({
          message: "Only the assigned driver can start the ride",
        });
      }
    }

    // Complete ride
    if (status === "completed") {
      if (ride.status !== "started") {
        return res.status(400).json({
          message: "Ride cannot be completed",
        });
      }

      if (
        !ride.driver ||
        ride.driver.toString() !== req.user.userId
      ) {
        return res.status(403).json({
          message: "Only the assigned driver can complete the ride",
        });
      }
    }

    // Cancel ride
    if (status === "cancelled") {
      if (
        ride.status === "completed" ||
        ride.status === "cancelled"
      ) {
        return res.status(400).json({
          message: "Ride cannot be cancelled",
        });
      }

      if (ride.passenger.toString() === req.user.userId) {
        ride.cancelledBy = "passenger";
      } else if (
        ride.driver &&
        ride.driver.toString() === req.user.userId
      ) {
        ride.cancelledBy = "driver";
      } else {
        return res.status(403).json({
          message: "You are not part of this ride",
        });
      }
    }

    ride.status = status;

    await ride.save();

    res.status(200).json({
      message: "Ride status updated successfully",
      ride,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update ride status",
      error: error.message,
    });
  }
};


module.exports = {
  createRide,
  getRideById,
  updateRideStatus,
};