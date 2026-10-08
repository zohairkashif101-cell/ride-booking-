const captainModel = require('../models/Captain');
const captainService = require('../services/captainService');
const { validationResult } = require('express-validator');
const BlacklistToken = require('../models/BlacklistToken');
const Ride = require('../models/Ride');

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000
};

module.exports.registerCaptain = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array(), message: errors.array()[0]?.msg });
        }

        const { fullname, email, password, vehicle } = req.body;
        const firstname = fullname?.firstname || req.body.firstName || req.body.firstname;
        const lastname = fullname?.lastname || req.body.lastName || req.body.lastname || '';

        const color = vehicle?.color || req.body.vehicleColor || req.body.color;
        const plate = vehicle?.plate || req.body.vehiclePlate || req.body.plate;
        const capacity = vehicle?.capacity || req.body.vehicleCapacity || req.body.capacity;
        const vehicleType = vehicle?.vehicleType || req.body.vehicleType;

        const isCaptainExist = await captainModel.findOne({ email });
        if (isCaptainExist) {
            return res.status(400).json({ message: 'Captain already exists with this email' });
        }

        const hashedPassword = await captainModel.hashPassword(password);
        const captain = await captainService.createCaptain({
            firstname, lastname, email, password: hashedPassword, color, plate, capacity: Number(capacity), vehicleType
        });

        const token = captain.generateAuthToken();
        res.cookie('token', token, cookieOptions);

        captain.password = undefined;
        return res.status(201).json({ token, captain });
    } catch (err) {
        console.error('Captain register error:', err);
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Captain already exists with this email' });
        }
        return res.status(500).json({ message: 'Server error during captain registration' });
    }
};

module.exports.loginCaptain = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array(), message: errors.array()[0]?.msg });
        }

        const { email, password } = req.body;
        const captain = await captainModel.findOne({ email }).select('+password');

        if (!captain || !(await captain.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = captain.generateAuthToken();
        res.cookie('token', token, cookieOptions);

        captain.password = undefined;
        return res.status(200).json({ token, captain });
    } catch (err) {
        console.error('Captain login error:', err);
        return res.status(500).json({ message: 'Server error during captain login' });
    }
};

module.exports.getCaptainProfile = async (req, res) => {
    return res.status(200).json(req.captain);
};

module.exports.logoutCaptain = async (req, res) => {
    try {
        res.clearCookie('token', cookieOptions);
        const token = req.cookies?.token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);

        if (token) {
            await BlacklistToken.findOneAndUpdate({ token }, { token }, { upsert: true, new: true });
        }

        return res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
        console.error('Captain logout error:', err);
        return res.status(500).json({ message: 'Server error during logout' });
    }
};

module.exports.updateCaptainStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['active', 'inactive'].includes(status)) {
            return res.status(400).json({ message: 'Status must be active or inactive' });
        }

        const captain = await captainModel.findByIdAndUpdate(req.captain._id, { status }, { new: true });
        return res.status(200).json({ message: 'Status updated', captain });
    } catch (err) {
        console.error('Captain status update error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports.getCaptainRideHistory = async (req, res) => {
    try {
        const rides = await Ride.find({ driver: req.captain._id })
            .populate('passenger', 'fullname email')
            .sort({ createdAt: -1 });

        return res.status(200).json({ rides });
    } catch (err) {
        console.error('Captain ride history error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports.getCaptainEarnings = async (req, res) => {
    try {
        const completedRides = await Ride.find({ driver: req.captain._id, status: 'completed' })
            .populate('passenger', 'fullname email')
            .sort({ createdAt: -1 });

        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        let totalEarnings = 0;
        let todayEarnings = 0;
        let weeklyEarnings = 0;

        completedRides.forEach((ride) => {
            const fare = Number(ride.fare) || 0;
            totalEarnings += fare;

            const rideDate = new Date(ride.createdAt);
            if (rideDate >= startOfDay) todayEarnings += fare;
            if (rideDate >= startOfWeek) weeklyEarnings += fare;
        });

        return res.status(200).json({
            totalEarnings,
            todayEarnings,
            weeklyEarnings,
            completedRidesCount: completedRides.length,
            recentRides: completedRides.slice(0, 10),
        });
    } catch (err) {
        console.error('Captain earnings error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};