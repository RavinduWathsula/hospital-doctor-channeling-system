const appointmentsService = require('../services/appointmentsService');

exports.getAll = async (req, res, next) => {
    try {
        const data = await appointmentsService.getAll();
        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
};

exports.getPatientAppointments = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const data = await appointmentsService.getPatientAppointments(userId);
        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
};

exports.getAppointmentById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const role = req.user.role;
        
        const data = await appointmentsService.getAppointmentById(id, userId, role);
        if (!data) return res.status(404).json({ success: false, message: 'Appointment not found' });
        
        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const insertId = await appointmentsService.createAppointment(userId, req.body);
        
        const data = await appointmentsService.getAppointmentById(insertId, userId, req.user.role);
        
        res.status(201).json({
            success: true,
            message: 'Appointment booked successfully',
            data
        });
    } catch (error) {
        if (
            error.message.includes('booked by another') || 
            error.message.includes('already have an appointment') ||
            error.message.includes('not available')
        ) {
            return res.status(409).json({ success: false, message: error.message });
        }
        next(error);
    }
};

exports.cancel = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const success = await appointmentsService.cancelAppointment(id, userId);
        
        if (!success) {
            return res.status(400).json({ success: false, message: 'Unable to cancel appointment. It may already be cancelled or completed, or does not belong to you.' });
        }

        res.status(200).json({
            success: true,
            message: 'Appointment cancelled successfully'
        });
    } catch (error) {
        next(error);
    }
};

exports.getDoctorAppointments = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const data = await appointmentsService.getDoctorAppointments(userId);
        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
};

exports.updateStatus = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({ success: false, message: 'Status is required' });
        }
        
        const success = await appointmentsService.updateAppointmentStatus(id, userId, status);
        
        if (!success) {
            return res.status(400).json({ success: false, message: 'Unable to update status. Appointment not found or you do not have permission.' });
        }

        res.status(200).json({
            success: true,
            message: 'Appointment status updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

exports.updateAdminStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({ success: false, message: 'Status is required' });
        }
        
        const success = await appointmentsService.updateAppointmentStatusAdmin(id, status);
        
        if (!success) {
            return res.status(400).json({ success: false, message: 'Unable to update status. Appointment not found.' });
        }

        res.status(200).json({
            success: true,
            message: 'Appointment status updated successfully by Admin/Receptionist'
        });
    } catch (error) {
        next(error);
    }
};
