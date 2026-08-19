const queuesService = require('../services/queuesService');

exports.getAll = async (req, res, next) => {
    try {
        const data = await queuesService.getAll();
        res.status(200).json({
            success: true,
            message: 'Queues retrieved successfully',
            data
        });
    } catch (error) {
        next(error);
    }
};
