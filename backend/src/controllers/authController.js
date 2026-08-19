const authService = require('../services/authService');
const { validationResult } = require('express-validator');

exports.register = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400);
            const err = new Error('Validation failed');
            err.errors = errors.array();
            throw err;
        }

        const data = await authService.registerPatient(req.body);
        res.status(201).json({
            success: true,
            message: 'Patient registered successfully',
            data
        });
    } catch (error) {
        if (error.message === 'User with this email or NIC already exists') {
            res.status(409);
        }
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400);
            const err = new Error('Validation failed');
            err.errors = errors.array();
            throw err;
        }

        const { email, password } = req.body;
        const data = await authService.loginUser(email, password);

        res.status(200).json({
            success: true,
            message: 'Logged in successfully',
            data
        });
    } catch (error) {
        if (error.message === 'Invalid email or password') {
            res.status(401);
        }
        next(error);
    }
};

exports.getMe = async (req, res, next) => {
    try {
        const data = await authService.getUserById(req.user.id);
        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
};
