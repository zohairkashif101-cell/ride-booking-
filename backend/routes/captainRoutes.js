const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const captainController = require('../controllers/captainController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', [
    body('email').isEmail().withMessage('Invalid Email'),
    body('fullname.firstname').custom((value, { req }) => {
        const firstname = value || req.body.firstname || req.body.firstName;
        if (!firstname || firstname.length < 3) {
            throw new Error('First name must be at least 3 characters long');
        }
        return true;
    }),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('vehicle.color').custom((value, { req }) => {
        const color = value || req.body.vehicleColor || req.body.color;
        if (!color || color.length < 3) {
            throw new Error('Color must be at least 3 characters long');
        }
        return true;
    }),
    body('vehicle.plate').custom((value, { req }) => {
        const plate = value || req.body.vehiclePlate || req.body.plate;
        if (!plate || plate.length < 3) {
            throw new Error('Plate must be at least 3 characters long');
        }
        return true;
    }),
    body('vehicle.capacity').custom((value, { req }) => {
        const capacity = value !== undefined ? value : (req.body.vehicleCapacity !== undefined ? req.body.vehicleCapacity : req.body.capacity);
        const num = Number(capacity);
        if (!Number.isInteger(num) || num < 1) {
            throw new Error('Capacity must be at least 1');
        }
        return true;
    }),
    body('vehicle.vehicleType').custom((value, { req }) => {
        const vehicleType = value || req.body.vehicleType;
        if (!['car', 'motorcycle', 'auto', 'moto'].includes(vehicleType)) {
            throw new Error('Invalid vehicle type');
        }
        return true;
    })
], captainController.registerCaptain);

router.post('/login', [
    body('email').isEmail().withMessage('Invalid Email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], captainController.loginCaptain);

router.get('/profile', authMiddleware.authCaptain, captainController.getCaptainProfile);
router.get('/logout', authMiddleware.authCaptain, captainController.logoutCaptain);

// Toggle captain online/offline status
router.put('/status', authMiddleware.authCaptain, captainController.updateCaptainStatus);

// Get captain's ride history (rides where this captain was the driver)
router.get('/rides/history', authMiddleware.authCaptain, captainController.getCaptainRideHistory);

// Get captain's earnings summary calculated from completed rides
router.get('/earnings', authMiddleware.authCaptain, captainController.getCaptainEarnings);

module.exports = router;
