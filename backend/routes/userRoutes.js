const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/userController');
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
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], userController.registerUser);

router.post('/login', [
    body('email').isEmail().withMessage('Invalid Email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], userController.loginUser);

router.get('/profile', authMiddleware.authUser, userController.getUserProfile);

// Changed GET to POST for Logout Security
router.post('/logout', authMiddleware.authUser, userController.logoutUser);

module.exports = router;
