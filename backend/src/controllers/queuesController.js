const queuesService = require('../services/queuesService');

exports.getAll = async (req, res, next) => {
    try {
        const data = await queuesService.getAll();
        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
};

exports.getPatientQueue = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const data = await queuesService.getPatientQueue(userId);
        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
};

exports.getDoctorQueue = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const data = await queuesService.getDoctorQueue(userId);
        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
};
