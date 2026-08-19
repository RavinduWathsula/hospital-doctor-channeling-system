const reportsService = require('../services/reportsService');

exports.getDashboardStats = async (req, res, next) => {
    try {
        const data = await reportsService.getDashboardStats();
        res.status(200).json({
            success: true,
            message: 'Dashboard stats retrieved successfully',
            data
        });
    } catch (error) {
        next(error);
    }
};
