const notificationsService = require('../services/notificationsService');

exports.getMyNotifications = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const data = await notificationsService.getMyNotifications(userId);
        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
};

exports.markAsRead = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const success = await notificationsService.markAsRead(id, userId);
        
        if (!success) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Notification marked as read'
        });
    } catch (error) {
        next(error);
    }
};
