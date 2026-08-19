const patientsService = require('../services/patientsService');
exports.getAll = async (req, res, next) => {
    try {
        const data = await patientsService.getAll();
        res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
};
exports.updateStatus = async (req, res, next) => {
    try {
        const { id } = req.params; // this is user_id
        const { isActive } = req.body;
        await patientsService.updateStatus(id, isActive);
        res.status(200).json({ success: true, message: 'Patient status updated' });
    } catch (error) { next(error); }
};