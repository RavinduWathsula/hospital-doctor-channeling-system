const appointmentsService = require('../services/appointmentsService');

exports.getAll = async (req, res, next) => {
    try {
        const data = await appointmentsService.getAll();
        res.status(200).json({
            success: true,
            message: 'Appointments retrieved successfully',
            data
        });
    } catch (error) {
        next(error);
    }
};
