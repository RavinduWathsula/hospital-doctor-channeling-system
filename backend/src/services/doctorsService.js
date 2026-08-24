const pool = require('../config/database');
const bcrypt = require('bcryptjs');

exports.getAll = async () => {
    const [rows] = await pool.query(`
        SELECT d.*, u.first_name, u.last_name, u.email, u.phone, u.nic, u.profile_image, dept.name as department_name 
        FROM doctors d
        JOIN users u ON d.user_id = u.id
        JOIN departments dept ON d.department_id = dept.id
    `);
    return rows;
};

exports.getById = async (id) => {
    const [rows] = await pool.query(`
        SELECT d.*, u.first_name, u.last_name, u.email, u.phone, u.nic, u.profile_image, dept.name as department_name 
        FROM doctors d
        JOIN users u ON d.user_id = u.id
        JOIN departments dept ON d.department_id = dept.id
        WHERE d.id = ?
    `, [id]);
    return rows[0] || null;
};

exports.getByUserId = async (userId) => {
    const [rows] = await pool.query(`
        SELECT d.*, u.first_name, u.last_name, u.email, u.phone, u.nic, u.profile_image, dept.name as department_name 
        FROM doctors d
        JOIN users u ON d.user_id = u.id
        JOIN departments dept ON d.department_id = dept.id
        WHERE d.user_id = ?
    `, [userId]);
    return rows[0] || null;
};

exports.create = async (doctorData) => {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    try {
        const hashedPassword = await bcrypt.hash(doctorData.password, 10);
        
        // 1. Create User
        const [userResult] = await connection.query(`
            INSERT INTO users (first_name, last_name, email, password_hash, phone, role, profile_image, is_active)
            VALUES (?, ?, ?, ?, ?, 'DOCTOR', ?, true)
        `, [
            doctorData.firstName, 
            doctorData.lastName, 
            doctorData.email, 
            hashedPassword, 
            doctorData.phone,
            doctorData.profileImage || null
        ]);
        
        const userId = userResult.insertId;

        // 2. Create Doctor
        const [doctorResult] = await connection.query(`
            INSERT INTO doctors (user_id, department_id, specialization, qualification, experience_years, consultation_fee, registration_number, biography, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, true)
        `, [
            userId,
            doctorData.departmentId,
            doctorData.specialization,
            doctorData.qualification,
            doctorData.experienceYears || 0,
            doctorData.consultationFee,
            doctorData.registrationNumber,
            doctorData.biography || null
        ]);

        await connection.commit();
        return doctorResult.insertId;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

exports.update = async (id, doctorData) => {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    try {
        const [rows] = await connection.query('SELECT user_id FROM doctors WHERE id = ?', [id]);
        if (rows.length === 0) throw new Error('Doctor not found');
        const userId = rows[0].user_id;

        // 1. Update User
        let userQuery = 'UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ?';
        let userParams = [doctorData.firstName, doctorData.lastName, doctorData.email, doctorData.phone];
        
        if (doctorData.password) {
            const hashedPassword = await bcrypt.hash(doctorData.password, 10);
            userQuery += ', password_hash = ?';
            userParams.push(hashedPassword);
        }
        if (doctorData.profileImage) {
            userQuery += ', profile_image = ?';
            userParams.push(doctorData.profileImage);
        }
        userQuery += ' WHERE id = ?';
        userParams.push(userId);
        
        await connection.query(userQuery, userParams);

        // 2. Update Doctor
        await connection.query(`
            UPDATE doctors 
            SET department_id = ?, specialization = ?, qualification = ?, experience_years = ?, consultation_fee = ?, registration_number = ?, biography = ?
            WHERE id = ?
        `, [
            doctorData.departmentId,
            doctorData.specialization,
            doctorData.qualification,
            doctorData.experienceYears || 0,
            doctorData.consultationFee,
            doctorData.registrationNumber,
            doctorData.biography || null,
            id
        ]);

        await connection.commit();
        return true;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

exports.updateMe = async (userId, doctorData) => {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    try {
        const [rows] = await connection.query('SELECT id FROM doctors WHERE user_id = ?', [userId]);
        if (rows.length === 0) throw new Error('Doctor not found');
        const doctorId = rows[0].id;

        // 1. Update User
        await connection.query(
            'UPDATE users SET phone = ? WHERE id = ?',
            [doctorData.phone, userId]
        );

        // 2. Update Doctor
        await connection.query(`
            UPDATE doctors 
            SET specialization = ?, qualification = ?, experience_years = ?, consultation_fee = ?
            WHERE id = ?
        `, [
            doctorData.specialization,
            doctorData.qualification,
            doctorData.experienceYears || 0,
            doctorData.consultationFee,
            doctorId
        ]);

        await connection.commit();
        return true;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

exports.updateStatus = async (id, isActive) => {
    // Optionally, could update the linked user as well. We'll stick to doctor table for now.
    await pool.query('UPDATE doctors SET is_active = ? WHERE id = ?', [isActive, id]);
};

exports.delete = async (id) => {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    try {
        const [rows] = await connection.query('SELECT user_id FROM doctors WHERE id = ?', [id]);
        if (rows.length === 0) throw new Error('Doctor not found');
        const userId = rows[0].user_id;

        // Delete dependencies first to avoid foreign key constraints
        await connection.query('DELETE FROM appointments WHERE doctor_id = ?', [id]);
        await connection.query('DELETE FROM doctor_schedules WHERE doctor_id = ?', [id]);
        await connection.query('DELETE FROM doctors WHERE id = ?', [id]);
        await connection.query('DELETE FROM users WHERE id = ?', [userId]);

        await connection.commit();
        return true;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

exports.search = async ({ name, departmentId, specialization }) => {
    let query = `
        SELECT d.*, u.first_name, u.last_name, u.email, u.phone, u.profile_image, dept.name as department_name 
        FROM doctors d
        JOIN users u ON d.user_id = u.id
        JOIN departments dept ON d.department_id = dept.id
        WHERE d.is_active = true
    `;
    const params = [];

    if (name) {
        query += ` AND (u.first_name LIKE ? OR u.last_name LIKE ?)`;
        params.push(`%${name}%`, `%${name}%`);
    }
    if (departmentId) {
        query += ` AND d.department_id = ?`;
        params.push(departmentId);
    }
    if (specialization) {
        query += ` AND d.specialization LIKE ?`;
        params.push(`%${specialization}%`);
    }

    const [rows] = await pool.query(query, params);
    return rows;
};
