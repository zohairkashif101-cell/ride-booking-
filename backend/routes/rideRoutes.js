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

// Get current user's ride history
router.get("/my/history", protect, getMyRides);


// =========================
// CAPTAIN ROUTES
// =========================

router.get("/requests", authCaptain, getRequestedRides);

router.put("/captain/:id/status", authCaptain, updateRideStatus);

router.put("/captain/:id/reject", authCaptain, rejectRide);


// =========================
// USER RIDE ROUTES
// =========================

router.get("/:id", protect, getRideById);

router.put("/:id/status", protect, updateRideStatus);


module.exports = router;