const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const userRoutes = require('./routes/userRoutes');
const captainRoutes = require('./routes/captainRoutes');
const rideRoutes = require('./routes/rideRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const ratingRoutes = require('./routes/ratingRoutes');

const app = express();

// CORS configuration (allow requests from frontend with cookies / headers)
app.use(cors({
    origin: true,
    credentials: true
}));

// Body parser & Cookie parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// HTTP request logger in dev
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// Routes
app.use('/users', userRoutes);
app.use('/captains', captainRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/ratings', ratingRoutes);

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ message: 'Ride Booking & Uber Clone API is running' });
});

module.exports = app;