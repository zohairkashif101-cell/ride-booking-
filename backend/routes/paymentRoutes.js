const express = require("express");
const router = express.Router();
const { processPayment, getPaymentByRide } = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

// process a payment for a ride
router.post("/process", protect, processPayment);

// get payment details for a specific ride 
router.get("/ride/:rideId", protect, getPaymentByRide);

module.exports = router;