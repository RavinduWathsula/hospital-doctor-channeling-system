const notificationsService = require('../services/notificationsService');

exports.getAll = async (req, res, next) => {
    try {
        const data = await notificationsService.getAll();
        res.status(200).json({
            success: true,
            message: 'Notifications retrieved successfully',
            data
        });
    } catch (error) {
        next(error);
    }
};
