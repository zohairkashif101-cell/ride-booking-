const express = require("express");
const router = express.Router();

const {
    createRide,
    getRequestedRides,
    getRideById,
    rejectRide,
    updateRideStatus,
    getMyRides,
} = require("../controllers/rideController");

const {
    protect,
    authCaptain
} = require("../middleware/authMiddleware");

// =========================
// USER ROUTES
// =========================
router.post("/book", protect, createRide);
router.get("/my/history", protect, getMyRides);

// =========================
// CAPTAIN ROUTES
// =========================
router.get("/requests", authCaptain, getRequestedRides);
router.put("/captain/:id/reject", authCaptain, rejectRide);

// Combined route for ride status updates (Accept/Start/Complete/Cancel)
router.put("/:id/status", protect, updateRideStatus);

// Single Ride details (Ownership protected in controller)
router.get("/:id", protect, getRideById);

module.exports = router;