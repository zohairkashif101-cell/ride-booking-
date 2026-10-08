const Payment = require("../models/Payment");
const Ride = require("../models/Ride");

// Process Payment
const processPayment = async (req, res) => {
  try {
    const { rideId, amount, method } = req.body;

    if (!rideId || !amount || !method) {
      return res.status(400).json({ message: "Ride ID, amount and payment method are required" });
    }

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    const userId = req.user?._id?.toString() || req.user?.userId?.toString();

    if (ride.passenger.toString() !== userId) {
      return res.status(403).json({ message: "You are not the passenger of this ride" });
    }

    if (ride.status !== "completed") {
      return res.status(400).json({ message: "Payment can only be processed after ride completion" });
    }

    if (!["cash", "card"].includes(method)) {
      return res.status(400).json({ message: "Invalid payment method" });
    }

    const existingPayment = await Payment.findOne({ ride: rideId });
    if (existingPayment) {
      return res.status(400).json({ message: "Payment already exists for this ride", payment: existingPayment });
    }

    const payment = await Payment.create({
      ride: rideId,
      passenger: userId,
      amount: Number(amount),
      method,
      status: "paid",
    });

    res.status(201).json({ message: "Payment processed successfully", payment });
  } catch (error) {
    console.error("Process Payment Error:", error);
    res.status(500).json({ message: "Failed to process payment" });
  }
};

// Get Payment By Ride
const getPaymentByRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const userId = req.user?._id?.toString() || req.user?.userId?.toString();

    const payment = await Payment.findOne({ ride: rideId })
      .populate("ride")
      .populate("passenger", "fullname email");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found for this ride" });
    }

    if (payment.passenger._id.toString() !== userId) {
      return res.status(403).json({ message: "You are not authorized to view this payment" });
    }

    res.status(200).json({ payment });
  } catch (error) {
    console.error("Get Payment Error:", error);
    res.status(500).json({ message: "Failed to get payment" });
  }
};

module.exports = { processPayment, getPaymentByRide };