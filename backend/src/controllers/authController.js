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

        let data;
        if (req.body.role === 'DOCTOR') {
            data = await authService.registerDoctor(req.body);
        } else {
            data = await authService.registerPatient(req.body);
        }

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data
        });
    } catch (error) {
        if (error.message === 'User with this email or NIC already exists' || error.message === 'User with this email or Registration Number already exists') {
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
        const user = await authService.getUserById(req.user.id);
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

exports.updatePassword = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        
        await authService.updatePassword(userId, currentPassword, newPassword);
        res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        if (error.message === 'Incorrect current password') {
            return res.status(400).json({ success: false, message: error.message });
        }
        next(error);
    }
};
