const pool = require('../config/database');

exports.getAll = async () => {
    const [rows] = await pool.query(`
        SELECT ds.*, d.specialization, u.first_name, u.last_name 
        FROM doctor_schedules ds
        JOIN doctors d ON ds.doctor_id = d.id
        JOIN users u ON d.user_id = u.id
        ORDER BY ds.day_of_week ASC, ds.start_time ASC
    `);
    return rows;
};

exports.getByDoctorId = async (doctorId) => {
    const [rows] = await pool.query(
        'SELECT * FROM doctor_schedules WHERE doctor_id = ? ORDER BY day_of_week ASC, start_time ASC',
        [doctorId]
    );
    return rows;
};

exports.getById = async (id) => {
    const [rows] = await pool.query('SELECT * FROM doctor_schedules WHERE id = ?', [id]);
    return rows[0];
};

exports.checkOverlap = async (doctorId, dayOfWeek, startTime, endTime, excludeId = null) => {
    let query = `
        SELECT id FROM doctor_schedules 
        WHERE doctor_id = ? AND day_of_week = ?
        AND (
            (start_time < ? AND end_time > ?) OR
            (start_time >= ? AND start_time < ?) OR
            (end_time > ? AND end_time <= ?)
        )
    `;
    const params = [doctorId, dayOfWeek, endTime, startTime, startTime, endTime, startTime, endTime];

    if (excludeId) {
        query += ' AND id != ?';
        params.push(excludeId);
    }

    const [rows] = await pool.query(query, params);
    return rows.length > 0;
};

exports.checkDuplicateDay = async (doctorId, dayOfWeek, excludeId = null) => {
    // Current schema has UNIQUE KEY (doctor_id, day_of_week)
    let query = 'SELECT id FROM doctor_schedules WHERE doctor_id = ? AND day_of_week = ?';
    const params = [doctorId, dayOfWeek];
    if (excludeId) {
        query += ' AND id != ?';
        params.push(excludeId);
    }
    const [rows] = await pool.query(query, params);
    return rows.length > 0;
}

exports.create = async (scheduleData) => {
    const { doctor_id, day_of_week, start_time, end_time, slot_duration_minutes, max_patients, status } = scheduleData;
    const [result] = await pool.query(
        'INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, slot_duration_minutes, max_patients, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [doctor_id, day_of_week, start_time, end_time, slot_duration_minutes, max_patients, status || 'ACTIVE']
    );
    return result.insertId;
};

exports.update = async (id, scheduleData) => {
    const { day_of_week, start_time, end_time, slot_duration_minutes, max_patients, status } = scheduleData;
    await pool.query(
        'UPDATE doctor_schedules SET day_of_week = ?, start_time = ?, end_time = ?, slot_duration_minutes = ?, max_patients = ?, status = ? WHERE id = ?',
        [day_of_week, start_time, end_time, slot_duration_minutes, max_patients, status, id]
    );
    return true;
};

exports.delete = async (id) => {
    await pool.query('DELETE FROM doctor_schedules WHERE id = ?', [id]);
    return true;
};
