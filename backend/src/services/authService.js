const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const smsService = require('./smsService');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

exports.registerPatient = async (patientData) => {
    const { firstName, lastName, email, password, nic, dateOfBirth, gender, phone, address, emergencyContact } = patientData;

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Check for duplicate email or nic
        const [existingUsers] = await connection.query('SELECT id FROM users WHERE email = ? OR nic = ?', [email, nic]);
        if (existingUsers.length > 0) {
            throw new Error('User with this email or NIC already exists');
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert into users
        const [userResult] = await connection.query(
            'INSERT INTO users (first_name, last_name, email, password_hash, nic, role, phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [firstName, lastName, email, hashedPassword, nic, 'PATIENT', phone]
        );

        const userId = userResult.insertId;

        // Insert into patients
        await connection.query(
            'INSERT INTO patients (user_id, date_of_birth, gender, address, emergency_contact) VALUES (?, ?, ?, ?, ?)',
            [userId, dateOfBirth || null, gender || null, address || null, emergencyContact || null]
        );

        await connection.commit();

        // Send Welcome SMS (non-blocking)
        if (phone) {
            smsService.sendWelcomeSMS(phone, firstName).catch(console.error);
        }

        return {
            id: userId,
            first_name: firstName,
            last_name: lastName,
            email,
            role: 'PATIENT',
            token: generateToken(userId, 'PATIENT')
        };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

exports.registerDoctor = async (doctorData) => {
    const { firstName, lastName, email, password, phone, registrationNumber, specialization, departmentId, qualification, experienceYears, consultationFee } = doctorData;

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Check for duplicate email or registration number
        const [existingUsers] = await connection.query('SELECT u.id FROM users u LEFT JOIN doctors d ON u.id = d.user_id WHERE u.email = ? OR d.registration_number = ?', [email, registrationNumber]);
        if (existingUsers.length > 0) {
            throw new Error('User with this email or Registration Number already exists');
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert into users
        const [userResult] = await connection.query(
            'INSERT INTO users (first_name, last_name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?, ?)',
            [firstName, lastName, email, hashedPassword, 'DOCTOR', phone]
        );

        const userId = userResult.insertId;

        // Insert into doctors
        await connection.query(
            'INSERT INTO doctors (user_id, department_id, specialization, qualification, experience_years, consultation_fee, registration_number, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [userId, departmentId, specialization, qualification || null, experienceYears || 0, consultationFee, registrationNumber, 0] // 0 for inactive, needs admin approval, or 1 for auto-active? Let's use 1 to allow immediate login, or match existing logic. Wait, let's use 1 for now.
        );
        // Wait, I should update the query to use 1 for is_active.
        await connection.query('UPDATE doctors SET is_active = 1 WHERE user_id = ?', [userId]);

        await connection.commit();

        return {
            id: userId,
            first_name: firstName,
            last_name: lastName,
            email,
            role: 'DOCTOR',
            token: generateToken(userId, 'DOCTOR')
        };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

exports.loginUser = async (email, password) => {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
        throw new Error('Invalid email or password');
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        throw new Error('Invalid email or password');
    }

    return {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id, user.role)
    };
};

exports.getUserById = async (id) => {
    const [users] = await pool.query('SELECT id, first_name, last_name, email, nic, role, phone FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
        throw new Error('User not found');
    }
    return users[0];
};

exports.updatePassword = async (userId, currentPassword, newPassword) => {
    const [users] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [userId]);
    if (users.length === 0) throw new Error('User not found');

    const isMatch = await bcrypt.compare(currentPassword, users[0].password_hash);
    if (!isMatch) throw new Error('Incorrect current password');

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);
    
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, userId]);
};
