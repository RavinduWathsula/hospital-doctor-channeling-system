const schedulesService = require('../services/schedulesService');

exports.getAll = async (req, res, next) => {
    try {
        const data = await schedulesService.getAll();
        res.status(200).json({
            success: true,
            message: 'Schedules retrieved successfully',
            data
        });
    } catch (error) {
        next(error);
    }
};
