const userModel = require('../models/User');
const captainModel = require('../models/Captain');
const BlacklistToken = require('../models/BlacklistToken');
const jwt = require('jsonwebtoken');


// =========================
// USER AUTHENTICATION
// =========================

module.exports.authUser = async (req, res, next) => {
    try {

        const token =
            req.cookies?.token ||
            (
                req.headers.authorization &&
                    req.headers.authorization.startsWith('Bearer ')
                    ? req.headers.authorization.split(' ')[1]
                    : null
            );

        if (!token) {
            return res.status(401).json({
                message: 'Unauthorized: No token provided'
            });
        }

        const isBlacklisted = await BlacklistToken.findOne({
            token: token
        });

        if (isBlacklisted) {
            return res.status(401).json({
                message: 'Unauthorized: Token has been revoked'
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET ||
            'ride_booking_jwt_secret_key_2026_super_secure'
        );

        const user = await userModel.findById(
            decoded._id || decoded.userId
        );

        if (!user) {
            return res.status(401).json({
                message: 'Unauthorized: User not found'
            });
        }

        req.user = user;

        return next();

    } catch (err) {

        return res.status(401).json({
            message: 'Unauthorized: Invalid token',
            error: err.message
        });

    }
};


// =========================
// CAPTAIN AUTHENTICATION
// =========================

module.exports.authCaptain = async (req, res, next) => {
    try {

        const token =
            req.cookies?.token ||
            (
                req.headers.authorization &&
                    req.headers.authorization.startsWith('Bearer ')
                    ? req.headers.authorization.split(' ')[1]
                    : null
            );

        if (!token) {
            return res.status(401).json({
                message: 'Unauthorized: No token provided'
            });
        }

        const isBlacklisted = await BlacklistToken.findOne({
            token: token
        });

        if (isBlacklisted) {
            return res.status(401).json({
                message: 'Unauthorized: Token has been revoked'
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET ||
            'ride_booking_jwt_secret_key_2026_super_secure'
        );

        const captain = await captainModel.findById(
            decoded._id || decoded.userId
        );

        if (!captain) {
            return res.status(401).json({
                message: 'Unauthorized: Captain not found'
            });
        }

        // Captain object
        req.captain = captain;

        // Compatibility with rideController
        req.user = {
            userId: captain._id.toString(),
            role: 'driver'
        };

        return next();

    } catch (err) {

        return res.status(401).json({
            message: 'Unauthorized: Invalid token',
            error: err.message
        });

    }
};


// =========================
// BACKWARD COMPATIBILITY
// =========================

module.exports.protect = module.exports.authUser;