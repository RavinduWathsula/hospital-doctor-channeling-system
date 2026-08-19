const doctorsService = require('../services/doctorsService');

exports.getAll = async (req, res, next) => {
    try {
        const data = await doctorsService.getAll();
        res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

exports.getById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = await doctorsService.getById(id);
        if (!data) return res.status(404).json({ success: false, message: 'Doctor not found' });
        res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const insertId = await doctorsService.create(req.body);
        res.status(201).json({ success: true, data: { id: insertId }, message: 'Doctor created successfully' });
    } catch (error) {
        // If email or registration number already exists, catch it
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Email or Registration Number already exists' });
        }
        next(error);
    }
};

exports.updateStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        await doctorsService.updateStatus(id, isActive);
        res.status(200).json({ success: true, message: 'Doctor status updated' });
    } catch (error) {
        next(error);
    }
};

exports.search = async (req, res, next) => {
    try {
        const { name, departmentId, specialization } = req.query;
        const data = await doctorsService.search({ name, departmentId, specialization });
        res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
};
