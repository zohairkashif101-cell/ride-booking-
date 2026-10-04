const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const rideRoutes = require("./routes/rideRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const ratingRoutes = require("./routes/ratingRoutes");

const app = express();

// Security middleware
app.use(helmet());

// Allow frontend requests
app.use(cors());

// Read JSON request body
app.use(express.json());

// HTTP request logger
app.use(morgan("dev"));

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later",
});

app.use(limiter);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/rides", rideRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/ratings", ratingRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Ride Booking API is running",
  });
});

module.exports = app;