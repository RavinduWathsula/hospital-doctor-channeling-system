const pool = require('../config/database');
exports.getAll = async () => {
    const [rows] = await pool.query(`
        SELECT p.*, u.first_name, u.last_name, u.email, u.phone, u.nic, u.is_active 
        FROM patients p
        JOIN users u ON p.user_id = u.id
    `);
    return rows;
};
exports.updateStatus = async (userId, isActive) => {
    await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [isActive, userId]);
};

exports.getMe = async (userId) => {
    const [rows] = await pool.query(`
        SELECT p.*, u.first_name, u.last_name, u.email, u.phone, u.nic 
        FROM patients p
        JOIN users u ON p.user_id = u.id
        WHERE u.id = ?
    `, [userId]);
    return rows[0];
};

exports.updateMe = async (userId, data) => {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    try {
        await connection.query(`
            UPDATE users 
            SET first_name = ?, last_name = ?, phone = ? 
            WHERE id = ?
        `, [data.first_name, data.last_name, data.phone, userId]);

        await connection.query(`
            UPDATE patients 
            SET date_of_birth = ?, gender = ?, blood_group = ?, address = ?, emergency_contact = ?, medical_history = ?
            WHERE user_id = ?
        `, [data.date_of_birth || null, data.gender || null, data.blood_group || null, data.address || null, data.emergency_contact || null, data.medical_history || null, userId]);

        await connection.commit();
        return true;
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
};

exports.updatePatientAdmin = async (patientId, data) => {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    try {
        // Find user_id from patientId
        const [patients] = await connection.query('SELECT user_id FROM patients WHERE id = ?', [patientId]);
        if (patients.length === 0) throw new Error('Patient not found');
        const userId = patients[0].user_id;

        await connection.query(`
            UPDATE users 
            SET first_name = ?, last_name = ?, phone = ? 
            WHERE id = ?
        `, [data.first_name, data.last_name, data.phone, userId]);

        await connection.query(`
            UPDATE patients 
            SET date_of_birth = ?, gender = ?, blood_group = ?, address = ?, emergency_contact = ?, medical_history = ?
            WHERE id = ?
        `, [data.date_of_birth || null, data.gender || null, data.blood_group || null, data.address || null, data.emergency_contact || null, data.medical_history || null, patientId]);

        await connection.commit();
        return true;
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
};

const bcrypt = require('bcryptjs');
exports.updatePassword = async (userId, currentPassword, newPassword) => {
    const [users] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [userId]);
    if (users.length === 0) throw new Error('User not found');
    
    const isMatch = await bcrypt.compare(currentPassword, users[0].password_hash);
    if (!isMatch) throw new Error('Incorrect current password');
    
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);
    
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, userId]);
    return true;
};