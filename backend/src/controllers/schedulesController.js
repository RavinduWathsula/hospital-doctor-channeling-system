const schedulesService = require('../services/schedulesService');

exports.getAll = async (req, res, next) => {
    try {
        const data = await schedulesService.getAll();
        res.status(200).json({
            success: true,
            message: 'Schedules retrieved successfully',
            data
        });
    } catch (error) {
        next(error);
    }
};

exports.getByDoctor = async (req, res, next) => {
    try {
        const { doctorId } = req.params;
        const data = await schedulesService.getByDoctorId(doctorId);
        res.status(200).json({
            success: true,
            message: 'Doctor schedules retrieved successfully',
            data
        });
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const { doctor_id, day_of_week, start_time, end_time, slot_duration_minutes, max_patients, status } = req.body;

        if (start_time >= end_time) {
            return res.status(400).json({ success: false, message: 'Start time must be before end time' });
        }
        if (slot_duration_minutes <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid consultation duration' });
        }

        const isDuplicateDay = await schedulesService.checkDuplicateDay(doctor_id, day_of_week);
        if (isDuplicateDay) {
            return res.status(400).json({ success: false, message: 'Schedule already exists for this day' });
        }

        const id = await schedulesService.create(req.body);
        res.status(201).json({
            success: true,
            message: 'Schedule created successfully',
            data: { id }
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Schedule already exists for this day (duplicate entry)' });
        }
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { doctor_id, day_of_week, start_time, end_time, slot_duration_minutes, max_patients, status } = req.body;

        if (start_time >= end_time) {
            return res.status(400).json({ success: false, message: 'Start time must be before end time' });
        }
        if (slot_duration_minutes <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid consultation duration' });
        }

        const isDuplicateDay = await schedulesService.checkDuplicateDay(doctor_id, day_of_week, id);
        if (isDuplicateDay) {
            return res.status(400).json({ success: false, message: 'Schedule already exists for this day' });
        }

        await schedulesService.update(id, req.body);
        res.status(200).json({
            success: true,
            message: 'Schedule updated successfully'
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Schedule already exists for this day (duplicate entry)' });
        }
        next(error);
    }
};

exports.delete = async (req, res, next) => {
    try {
        const { id } = req.params;
        await schedulesService.delete(id);
        res.status(200).json({
            success: true,
            message: 'Schedule deleted successfully'
        });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot delete schedule because appointments have already been booked for it.' 
            });
        }
        next(error);
    }
};
