const express = require("express");
const router = express.Router();
const { createRide, getRideById, updateRideStatus } = require("../controllers/rideController");
const { protect } = require("../middleware/authMiddleware");

// Protected Routes (Token zaroori hai)
router.post("/book", protect, createRide);          
router.get("/:id", protect, getRideById);           
router.put("/:id/status", protect, updateRideStatus); 

module.exports = router;