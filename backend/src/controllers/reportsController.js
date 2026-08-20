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

exports.getAnalytics = async (req, res, next) => {
    try {
        const filters = {
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            doctorId: req.query.doctorId,
            departmentId: req.query.departmentId,
            status: req.query.status
        };
        const data = await reportsService.getAnalytics(filters);
        res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
};
