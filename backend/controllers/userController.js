const userModel = require('../models/User');
const userService = require('../services/userService');
const { validationResult } = require('express-validator');
const BlacklistToken = require('../models/BlacklistToken');

module.exports.registerUser = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array(), message: errors.array()[0]?.msg });
        }

        const { fullname, email, password } = req.body;

        const firstname = fullname?.firstname || req.body.firstname || req.body.firstName;
        const lastname = fullname?.lastname || req.body.lastname || req.body.lastName || '';

        const isUserExist = await userModel.findOne({ email });

        if (isUserExist) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        const hashedPassword = await userModel.hashPassword(password);

        const user = await userService.createUser({
            firstname,
            lastname,
            email,
            password: hashedPassword
        });

        const token = user.generateAuthToken();

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000
        });

        user.password = undefined;

        return res.status(201).json({ token, user });
    } catch (err) {
        console.error('User register error:', err);
        if (err.code === 11000) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }
        return res.status(500).json({ message: err.message || 'Server error during user registration' });
    }
};

module.exports.loginUser = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array(), message: errors.array()[0]?.msg });
        }

        const { email, password } = req.body;

        const user = await userModel.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = user.generateAuthToken();

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000
        });

        user.password = undefined;

        return res.status(200).json({ token, user });
    } catch (err) {
        console.error('User login error:', err);
        return res.status(500).json({ message: err.message || 'Server error during user login' });
    }
};

module.exports.getUserProfile = async (req, res, next) => {
    return res.status(200).json(req.user);
};

module.exports.logoutUser = async (req, res, next) => {
    try {
        res.clearCookie('token');
        const token = req.cookies?.token || (req.headers.authorization && req.headers.authorization.startsWith('Bearer') ? req.headers.authorization.split(' ')[1] : null);

        if (token) {
            await BlacklistToken.findOneAndUpdate(
                { token },
                { token },
                { upsert: true, new: true }
            );
        }

        return res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
        console.error('User logout error:', err);
        return res.status(500).json({ message: err.message || 'Server error during logout' });
    }
};
