const userModel = require('../models/User');
const captainModel = require('../models/Captain');
const BlacklistToken = require('../models/BlacklistToken');
const jwt = require('jsonwebtoken');

// Helper function to extract token cleanly
const extractToken = (req) => {
    if (req.cookies && req.cookies.token) {
        return req.cookies.token;
    }
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        return req.headers.authorization.split(' ')[1];
    }
    return null;
};

// =========================
// USER AUTHENTICATION
// =========================
module.exports.authUser = async (req, res, next) => {
    try {
        const token = extractToken(req);

        if (!token) {
            return res.status(401).json({
                message: 'Unauthorized: No token provided'
            });
        }

        const isBlacklisted = await BlacklistToken.findOne({ token });
        if (isBlacklisted) {
            return res.status(401).json({
                message: 'Unauthorized: Token has been revoked'
            });
        }

        // Enforce process.env.JWT_SECRET strictly in production
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findById(decoded._id || decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({
                message: 'Unauthorized: User not found'
            });
        }

        req.user = user;
        return next();

    } catch (err) {
        return res.status(401).json({
            message: 'Unauthorized: Invalid or expired token'
        });
    }
};

// =========================
// CAPTAIN AUTHENTICATION
// =========================
module.exports.authCaptain = async (req, res, next) => {
    try {
        const token = extractToken(req);

        if (!token) {
            return res.status(401).json({
                message: 'Unauthorized: No token provided'
            });
        }

        const isBlacklisted = await BlacklistToken.findOne({ token });
        if (isBlacklisted) {
            return res.status(401).json({
                message: 'Unauthorized: Token has been revoked'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const captain = await captainModel.findById(decoded._id || decoded.userId).select('-password');

        if (!captain) {
            return res.status(401).json({
                message: 'Unauthorized: Captain not found'
            });
        }

        req.captain = captain;
        req.user = {
            userId: captain._id.toString(),
            role: 'driver'
        };

        return next();

    } catch (err) {
        return res.status(401).json({
            message: 'Unauthorized: Invalid or expired token'
        });
    }
};

// =========================
// BACKWARD COMPATIBILITY
// =========================
module.exports.protect = module.exports.authUser;