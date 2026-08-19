const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

// @route   POST /api/auth/register
// @desc    Register a new patient
router.post(
    '/register',
    [
        body('firstName').notEmpty().withMessage('First name is required'),
        body('lastName').notEmpty().withMessage('Last name is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        body('nic').notEmpty().withMessage('NIC is required')
    ],
    authController.register
);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Valid email is required'),
        body('password').exists().withMessage('Password is required')
    ],
    authController.login
);

// @route   GET /api/auth/me
// @desc    Get current logged in user
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;
