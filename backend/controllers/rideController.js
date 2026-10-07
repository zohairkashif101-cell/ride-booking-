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

    if (!pickup.address || pickup.latitude === undefined || pickup.longitude === undefined) {
      return res.status(400).json({
        message: "Pickup must include address, latitude, and longitude",
      });
    }

    if (!destination.address || destination.latitude === undefined || destination.longitude === undefined) {
      return res.status(400).json({
        message: "Destination must include address, latitude, and longitude",
      });
    }

    const userId = req.user?._id || req.user?.userId;

    const ride = await Ride.create({
      passenger: userId,
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


// Get All Requested Rides (for captain)
const getRequestedRides = async (req, res) => {
  try {
    const captainId = req.captain?._id || req.user?.userId;
    const query = { status: "requested" };

    if (captainId) {
      query.rejectedCaptains = { $ne: captainId };
    }

    const rides = await Ride.find(query)
      .populate("passenger", "fullname email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      rides,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get ride requests",
      error: error.message,
    });
  }
};


// Get Current User's Rides (history)
const getMyRides = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.userId;

    const rides = await Ride.find({ passenger: userId })
      .populate("passenger", "fullname email")
      .populate("driver", "fullname email vehicle")
      .sort({ createdAt: -1 });

    res.status(200).json({
      rides,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get ride history",
      error: error.message,
    });
  }
};


// Get Single Ride
const getRideById = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate("passenger", "fullname email")
      .populate("driver", "fullname email vehicle");

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


// Reject Ride (Driver declines request)
const rejectRide = async (req, res) => {
  try {
    const captainId = req.captain?._id || req.user?.userId;

    if (!captainId) {
      return res.status(401).json({
        message: "Unauthorized: Driver identity required",
      });
    }

    const ride = await Ride.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { rejectedCaptains: captainId } },
      { new: true }
    );

    if (!ride) {
      return res.status(404).json({
        message: "Ride not found",
      });
    }

    res.status(200).json({
      message: "Ride request rejected",
      rideId: req.params.id,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to reject ride",
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

    const actingUserId = req.user?.userId || req.user?._id?.toString();

    // 1. Accept ride — Atomic operation to prevent duplicate assignment / race conditions
    if (status === "accepted") {
      if (req.user?.role !== "driver") {
        return res.status(403).json({
          message: "Only a driver can accept a ride",
        });
      }

      const assignedRide = await Ride.findOneAndUpdate(
        { _id: req.params.id, status: "requested" },
        { status: "accepted", driver: actingUserId },
        { new: true }
      )
        .populate("passenger", "fullname email")
        .populate("driver", "fullname email vehicle");

      if (!assignedRide) {
        return res.status(409).json({
          message: "This ride is no longer available or was already accepted by another driver.",
        });
      }

      return res.status(200).json({
        message: "Ride accepted successfully",
        ride: assignedRide,
      });
    }

    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({
        message: "Ride not found",
      });
    }

    // 2. Start ride
    if (status === "started") {
      if (ride.status !== "accepted") {
        return res.status(400).json({
          message: "Ride cannot be started unless accepted",
        });
      }

      if (
        !ride.driver ||
        ride.driver.toString() !== actingUserId
      ) {
        return res.status(403).json({
          message: "Only the assigned driver can start the ride",
        });
      }
    }

    // 3. Complete ride
    if (status === "completed") {
      if (ride.status !== "started") {
        return res.status(400).json({
          message: "Ride cannot be completed unless started",
        });
      }

      if (
        !ride.driver ||
        ride.driver.toString() !== actingUserId
      ) {
        return res.status(403).json({
          message: "Only the assigned driver can complete the ride",
        });
      }
    }

    // 4. Cancel ride
    if (status === "cancelled") {
      if (
        ride.status === "completed" ||
        ride.status === "cancelled"
      ) {
        return res.status(400).json({
          message: "Ride cannot be cancelled once completed or already cancelled",
        });
      }

      const passengerIdStr = ride.passenger?.toString();
      const driverIdStr = ride.driver?.toString();

      if (passengerIdStr === actingUserId) {
        ride.cancelledBy = "passenger";
      } else if (driverIdStr && driverIdStr === actingUserId) {
        ride.cancelledBy = "driver";
      } else {
        return res.status(403).json({
          message: "You are not authorized to cancel this ride",
        });
      }
    }

    ride.status = status;
    await ride.save();

    const populatedRide = await Ride.findById(ride._id)
      .populate("passenger", "fullname email")
      .populate("driver", "fullname email vehicle");

    return res.status(200).json({
      message: "Ride status updated successfully",
      ride: populatedRide,
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
  getRequestedRides,
  getMyRides,
  getRideById,
  rejectRide,
  updateRideStatus,
};