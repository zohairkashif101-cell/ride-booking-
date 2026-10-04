const Payment = require("../models/Payment");
const Ride = require("../models/Ride");

// Process Payment
const processPayment = async (req, res) => {
  try {
    const { rideId, amount, method } = req.body;

    // Check required fields
    if (!rideId || !amount || !method) {
      return res.status(400).json({
        message: "Ride ID, amount and payment method are required",
      });
    }

    // Check if ride exists
    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({
        message: "Ride not found",
      });
    }

    // Check if logged-in user is the passenger
    if (ride.passenger.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You are not the passenger of this ride",
      });
    }

    // Payment only after ride is completed
    if (ride.status !== "completed") {
      return res.status(400).json({
        message: "Payment can only be processed after ride completion",
      });
    }

    // Check payment method
    if (!["cash", "card"].includes(method)) {
      return res.status(400).json({
        message: "Invalid payment method",
      });
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({
      ride: rideId,
    });

    if (existingPayment) {
      return res.status(400).json({
        message: "Payment already exists for this ride",
      });
    }

    // Create payment
    const payment = await Payment.create({
      ride: rideId,
      passenger: req.user.userId,
      amount,
      method,
      status: method === "cash" ? "paid" : "pending",
    });

    res.status(201).json({
      message: "Payment processed successfully",
      payment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to process payment",
      error: error.message,
    });
  }
};

// Get Payment By Ride
const getPaymentByRide = async (req, res) => {
  try {
    const { rideId } = req.params;

    // Find payment
    const payment = await Payment.findOne({
      ride: rideId,
    })
      .populate("ride")
      .populate("passenger", "name email role");

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found for this ride",
      });
    }

    // Only passenger of the payment can view it
    if (payment.passenger._id.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You are not authorized to view this payment",
      });
    }

    res.status(200).json({
      payment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get payment",
      error: error.message,
    });
  }
};

module.exports = {
  processPayment,
  getPaymentByRide,
};