const pool = require('../config/database');
const notificationsService = require('./notificationsService');
const smsService = require('./smsService');

exports.getAll = async () => {
    const [rows] = await pool.query(`
        SELECT a.*, p.user_id as patient_user_id, u.first_name as patient_first_name, u.last_name as patient_last_name,
        d.user_id as doctor_user_id, du.first_name as doctor_first_name, du.last_name as doctor_last_name,
        dept.name as department_name
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        JOIN users u ON p.user_id = u.id
        JOIN doctors d ON a.doctor_id = d.id
        JOIN users du ON d.user_id = du.id
        JOIN departments dept ON d.department_id = dept.id
        ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `);
    return rows;
};

exports.getPatientAppointments = async (userId) => {
    const [rows] = await pool.query(`
        SELECT a.*, 
        d.id as doctor_id, du.first_name as doctor_first_name, du.last_name as doctor_last_name, 
        dept.name as department_name, d.specialization, d.consultation_fee
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
        
        // Trigger Notification & SMS
        const [doctorDetails] = await pool.query('SELECT first_name, last_name FROM users JOIN doctors ON users.id = doctors.user_id WHERE doctors.id = ?', [doctor_id]);
        if (doctorDetails.length > 0) {
            const docName = `Dr. ${doctorDetails[0].first_name} ${doctorDetails[0].last_name}`;
            await notificationsService.createNotification(
                userId,
                'Appointment Booked',
                `Your appointment with ${docName} on ${new Date(appointment_date).toLocaleDateString()} at ${appointment_time} (Queue #${queue_number}) has been booked successfully.`
            );
            
            // Get patient info for SMS
            const [patientDetails] = await pool.query('SELECT first_name, last_name, phone FROM users WHERE id = ?', [userId]);
            if (patientDetails.length > 0 && patientDetails[0].phone) {
                const patName = patientDetails[0].first_name;
                const patPhone = patientDetails[0].phone;
                // Combining Payment and Booking Confirmation as requested
                smsService.sendBookingConfirmationSMS(patPhone, patName, docName, new Date(appointment_date).toLocaleDateString(), appointment_time, queue_number).catch(console.error);
            }
        }

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

    if (result.affectedRows > 0) {
        await notificationsService.createNotification(
            userId,
            'Appointment Cancelled',
            `Your appointment (ID: ${id}) has been cancelled successfully.`
        );
        return true;
    }

    return false;
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
    
    if (result.affectedRows > 0) {
        // Fetch patient user_id to notify them
        const [appDetails] = await pool.query(`
            SELECT p.user_id, a.queue_number, u.first_name, u.last_name 
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            JOIN doctors d ON a.doctor_id = d.id
            JOIN users u ON d.user_id = u.id
            WHERE a.id = ?
        `, [id]);

        if (appDetails.length > 0) {
            const patientUserId = appDetails[0].user_id;
            const docName = `Dr. ${appDetails[0].first_name} ${appDetails[0].last_name}`;
            
            if (status === 'CALLED') {
                await notificationsService.createNotification(patientUserId, 'Queue Update', `${docName} is calling Queue #${appDetails[0].queue_number}. It is your turn!`);
            } else if (status === 'IN_CONSULTATION') {
                await notificationsService.createNotification(patientUserId, 'Consultation Started', `Your consultation with ${docName} has started.`);
            } else if (status === 'COMPLETED') {
                await notificationsService.createNotification(patientUserId, 'Consultation Completed', `Your consultation with ${docName} is complete. Thank you!`);
            }
        }
        return true;
    }
    return false;
};

exports.updateAppointmentStatusAdmin = async (id, status) => {
    const [result] = await pool.query(`
        UPDATE appointments
        SET status = ?
        WHERE id = ?
    `, [status, id]);
    
    if (result.affectedRows > 0) {
        // Fetch patient user_id
        const [appDetails] = await pool.query(`
            SELECT p.user_id, a.appointment_date, a.appointment_time, a.queue_number 
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            WHERE a.id = ?
        `, [id]);

        if (appDetails.length > 0) {
            const patientUserId = appDetails[0].user_id;
            
            if (status === 'CONFIRMED') {
                await notificationsService.createNotification(
                    patientUserId, 
                    'Appointment Confirmed', 
                    `Your appointment on ${new Date(appDetails[0].appointment_date).toLocaleDateString()} at ${appDetails[0].appointment_time} has been confirmed.`
                );
            } else if (status === 'WAITING') {
                await notificationsService.createNotification(
                    patientUserId, 
                    'Patient Checked In', 
                    `You have been checked in for your appointment. Your Queue Number is #${appDetails[0].queue_number}.`
                );
            }
        }
        return true;
    }
    return false;
};

