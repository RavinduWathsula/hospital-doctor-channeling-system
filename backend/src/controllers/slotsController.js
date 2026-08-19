const slotsService = require('../services/slotsService');

exports.getAll = async (req, res, next) => {
    try {
        const data = await slotsService.getAll();
        res.status(200).json({
            success: true,
            message: 'Slots retrieved successfully',
            data
        });
    } catch (error) {
        next(error);
    }
};
