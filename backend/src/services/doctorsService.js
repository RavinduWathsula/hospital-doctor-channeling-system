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

exports.updateStatus = async (id, isActive) => {
    // Optionally, could update the linked user as well. We'll stick to doctor table for now.
    await pool.query('UPDATE doctors SET is_active = ? WHERE id = ?', [isActive, id]);
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
