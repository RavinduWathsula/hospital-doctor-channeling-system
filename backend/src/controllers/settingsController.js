const settingsService = require('../services/settingsService');

exports.getAll = async (req, res, next) => {
    try {
        const data = await settingsService.getAll();
        res.status(200).json({
            success: true,
            message: 'Settings retrieved successfully',
            data
        });
    } catch (error) {
        next(error);
    }
};
