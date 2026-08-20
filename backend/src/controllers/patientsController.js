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

exports.getMe = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const data = await patientsService.getMe(userId);
        res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
};

exports.updateMe = async (req, res, next) => {
    try {
        const userId = req.user.id;
        await patientsService.updateMe(userId, req.body);
        const data = await patientsService.getMe(userId);
        res.status(200).json({ success: true, message: 'Profile updated successfully', data });
    } catch (error) { next(error); }
};

exports.updatePatientAdmin = async (req, res, next) => {
    try {
        const { id } = req.params;
        await patientsService.updatePatientAdmin(id, req.body);
        res.status(200).json({ success: true, message: 'Patient updated successfully' });
    } catch (error) { next(error); }
};

exports.updatePassword = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        await patientsService.updatePassword(userId, currentPassword, newPassword);
        res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        if (error.message.includes('Incorrect')) {
            return res.status(400).json({ success: false, message: error.message });
        }
        next(error);
    }
};