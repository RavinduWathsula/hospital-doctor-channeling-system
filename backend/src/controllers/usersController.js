const usersService = require('../services/usersService');
exports.getAll = async (req, res, next) => {
    try {
        const data = await usersService.getAll();
        res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
};
exports.updateStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        await usersService.updateStatus(id, isActive);
        res.status(200).json({ success: true, message: 'User status updated' });
    } catch (error) { next(error); }
};