const pool = require('../config/database');

exports.getAll = async () => {
    const [rows] = await pool.query(`
        SELECT a.*, p.user_id as patient_user_id, u.first_name as patient_first_name, u.last_name as patient_last_name,
        d.user_id as doctor_user_id, du.first_name as doctor_first_name, du.last_name as doctor_last_name
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        JOIN users u ON p.user_id = u.id
        JOIN doctors d ON a.doctor_id = d.id
        JOIN users du ON d.user_id = du.id
        ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `);
    return rows;
};

exports.getPatientAppointments = async (userId) => {
    const [rows] = await pool.query(`
        SELECT a.*, 
        d.id as doctor_id, du.first_name as doctor_first_name, du.last_name as doctor_last_name, 
        dept.name as department_name, d.specialization
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        JOIN doctors d ON a.doctor_id = d.id
        JOIN users du ON d.user_id = du.id
        JOIN departments dept ON d.department_id = dept.id
        WHERE p.user_id = ?
        ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `, [userId]);
    return rows;
};

exports.getAppointmentById = async (id, userId = null, role = null) => {
    // If PATIENT, ensure it belongs to them.
    let query = `
        SELECT a.*, 
        p.user_id as patient_user_id, u.first_name as patient_first_name, u.last_name as patient_last_name, u.email as patient_email, u.phone as patient_phone,
        d.id as doctor_id, du.first_name as doctor_first_name, du.last_name as doctor_last_name, 
        dept.name as department_name, d.specialization, d.consultation_fee
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        JOIN users u ON p.user_id = u.id
        JOIN doctors d ON a.doctor_id = d.id
        JOIN users du ON d.user_id = du.id
        JOIN departments dept ON d.department_id = dept.id
        WHERE a.id = ?
    `;
    const params = [id];
    
    if (role === 'PATIENT') {
        query += ` AND p.user_id = ?`;
        params.push(userId);
    }
    
    const [rows] = await pool.query(query, params);
    return rows[0] || null;
};

exports.createAppointment = async (userId, data) => {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        const { doctor_id, appointment_date, appointment_time, notes } = data;

        // 1. Find patient_id from user_id
        const [patients] = await connection.query('SELECT id FROM patients WHERE user_id = ?', [userId]);
        if (patients.length === 0) {
            throw new Error('Patient profile not found.');
        }
        const patient_id = patients[0].id;

        // 2. Verify doctor is active
        const [doctors] = await connection.query('SELECT is_active FROM doctors WHERE id = ?', [doctor_id]);
        if (doctors.length === 0 || !doctors[0].is_active) {
            throw new Error('Doctor is not available.');
        }

        // 3. Verify schedule exists for that day (1=Monday, 7=Sunday)
        const dateObj = new Date(appointment_date);
        let dayOfWeek = dateObj.getDay(); 
        if (dayOfWeek === 0) dayOfWeek = 7; // Convert 0 (Sunday) to 7

        const [schedules] = await connection.query(`
            SELECT id, start_time, end_time, slot_duration_minutes, max_patients 
            FROM doctor_schedules 
            WHERE doctor_id = ? AND day_of_week = ? AND status = 'ACTIVE'
        `, [doctor_id, dayOfWeek]);

        if (schedules.length === 0) {
            throw new Error('Doctor does not have an active schedule on this day.');
        }
        
        const schedule = schedules[0];
        
        // 4. Double Booking Check (Doctor) using FOR UPDATE
        const [existingDocApps] = await connection.query(`
            SELECT id FROM appointments 
            WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ? 
            AND status NOT IN ('CANCELLED', 'NO_SHOW')
            FOR UPDATE
        `, [doctor_id, appointment_date, appointment_time]);

        if (existingDocApps.length > 0) {
            throw new Error('This slot has already been booked by another patient.');
        }

        // 5. Check if Patient already has an appointment at this exact time
        const [existingPatApps] = await connection.query(`
            SELECT id FROM appointments 
            WHERE patient_id = ? AND appointment_date = ? AND appointment_time = ? 
            AND status NOT IN ('CANCELLED', 'NO_SHOW')
        `, [patient_id, appointment_date, appointment_time]);

        if (existingPatApps.length > 0) {
            throw new Error('You already have an appointment scheduled at this time.');
        }

        // 6. Generate Queue Number
        const [queueCount] = await connection.query(`
            SELECT COUNT(*) as count FROM appointments 
            WHERE doctor_id = ? AND appointment_date = ? AND status NOT IN ('CANCELLED')
        `, [doctor_id, appointment_date]);
        
        const queue_number = queueCount[0].count + 1;

        // 7. Insert Appointment
        const [result] = await connection.query(`
            INSERT INTO appointments 
            (patient_id, doctor_id, schedule_id, appointment_date, appointment_time, queue_number, status, notes)
            VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?)
        `, [patient_id, doctor_id, schedule.id, appointment_date, appointment_time, queue_number, notes || null]);

        await connection.commit();
        
        return result.insertId;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

exports.cancelAppointment = async (id, userId) => {
    // Only allow cancelling PENDING or CONFIRMED appointments
    const [result] = await pool.query(`
        UPDATE appointments a
        JOIN patients p ON a.patient_id = p.id
        SET a.status = 'CANCELLED'
        WHERE a.id = ? AND p.user_id = ? AND a.status IN ('PENDING', 'CONFIRMED')
    `, [id, userId]);

    return result.affectedRows > 0;
};

exports.getDoctorAppointments = async (userId) => {
    const [rows] = await pool.query(`
        SELECT a.*, 
        p.user_id as patient_user_id, u.first_name as patient_first_name, u.last_name as patient_last_name, u.email as patient_email, u.phone as patient_phone,
        d.id as doctor_id, du.first_name as doctor_first_name, du.last_name as doctor_last_name, 
        dept.name as department_name, d.specialization
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        JOIN users u ON p.user_id = u.id
        JOIN doctors d ON a.doctor_id = d.id
        JOIN users du ON d.user_id = du.id
        JOIN departments dept ON d.department_id = dept.id
        WHERE du.id = ?
        ORDER BY a.appointment_date DESC, a.appointment_time ASC
    `, [userId]);
    return rows;
};

exports.updateAppointmentStatus = async (id, userId, status) => {
    const [result] = await pool.query(`
        UPDATE appointments a
        JOIN doctors d ON a.doctor_id = d.id
        SET a.status = ?
        WHERE a.id = ? AND d.user_id = ?
    `, [status, id, userId]);
    
    return result.affectedRows > 0;
};

exports.updateAppointmentStatusAdmin = async (id, status) => {
    const [result] = await pool.query(`
        UPDATE appointments
        SET status = ?
        WHERE id = ?
    `, [status, id]);
    
    return result.affectedRows > 0;
};

