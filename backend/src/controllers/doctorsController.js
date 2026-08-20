const doctorsService = require('../services/doctorsService');

exports.getAll = async (req, res, next) => {
    try {
        const data = await doctorsService.getAll();
        res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

exports.getById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = await doctorsService.getById(id);
        if (!data) return res.status(404).json({ success: false, message: 'Doctor not found' });
        res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

exports.getMe = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const data = await doctorsService.getByUserId(userId);
        if (!data) return res.status(404).json({ success: false, message: 'Doctor profile not found' });
        res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const insertId = await doctorsService.create(req.body);
        res.status(201).json({ success: true, data: { id: insertId }, message: 'Doctor created successfully' });
    } catch (error) {
        // If email or registration number already exists, catch it
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Email or Registration Number already exists' });
        }
        next(error);
    }
};

exports.updateStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        await doctorsService.updateStatus(id, isActive);
        res.status(200).json({ success: true, message: 'Doctor status updated' });
    } catch (error) {
        next(error);
    }
};

exports.search = async (req, res, next) => {
    try {
        const { name, departmentId, specialization } = req.query;
        const data = await doctorsService.search({ name, departmentId, specialization });
        res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

const pool = require('../config/database');
const schedulesService = require('../services/schedulesService');

exports.getAvailability = async (req, res, next) => {
    try {
        const { id } = req.params;
        const schedules = await schedulesService.getByDoctorId(id);
        res.status(200).json({ success: true, data: schedules });
    } catch (error) {
        next(error);
    }
};

exports.getSlots = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { date } = req.query; // format: YYYY-MM-DD
        
        if (!date) {
            return res.status(400).json({ success: false, message: 'Date query parameter is required (YYYY-MM-DD)' });
        }

        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
            return res.status(400).json({ success: false, message: 'Invalid date format' });
        }

        // JS getDay() returns 0 for Sunday, 1 for Monday. Database schema uses 1=Monday, 7=Sunday
        let dayOfWeek = dateObj.getDay();
        if (dayOfWeek === 0) dayOfWeek = 7;

        // Fetch schedule for this day
        const schedules = await schedulesService.getByDoctorId(id);
        const schedule = schedules.find(s => s.day_of_week === dayOfWeek && s.status === 'ACTIVE');

        if (!schedule) {
            return res.status(200).json({ success: true, data: [] });
        }

        // Parse start and end times (format HH:MM:SS)
        const parseTime = (timeStr) => {
            const [hours, minutes] = timeStr.split(':').map(Number);
            return hours * 60 + minutes;
        };

        const formatTime = (totalMinutes) => {
            const h = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
            const m = (totalMinutes % 60).toString().padStart(2, '0');
            return `${h}:${m}:00`;
        };

        let startMinutes = parseTime(schedule.start_time);
        const endMinutes = parseTime(schedule.end_time);
        const duration = schedule.slot_duration_minutes;

        // Generate slots
        let allSlots = [];
        while (startMinutes + duration <= endMinutes) {
            allSlots.push(formatTime(startMinutes));
            startMinutes += duration;
        }

        // Check booked appointments for this date and doctor
        const [bookedAppointments] = await pool.query(
            'SELECT appointment_time FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND status NOT IN ("CANCELLED", "NO_SHOW")',
            [id, date]
        );
        
        const bookedTimes = bookedAppointments.map(a => {
            // Depending on mysql driver, appointment_time might be a string or a Date object
            if (typeof a.appointment_time === 'string') {
                return a.appointment_time;
            }
            // If it's a Buffer or something else, handle accordingly. Assuming string for HH:MM:SS
            return a.appointment_time;
        });

        // Some formatting adjustment might be needed depending on DB return format (e.g., '09:00:00')
        const availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot));

        res.status(200).json({ success: true, data: availableSlots });
    } catch (error) {
        next(error);
    }
};
