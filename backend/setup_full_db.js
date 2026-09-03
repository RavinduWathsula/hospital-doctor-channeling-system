const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
    try {
        console.log('Connecting to MySQL...');
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            multipleStatements: true
        });

        console.log('Creating database if not exists...');
        await connection.query('CREATE DATABASE IF NOT EXISTS smart_hospital;');
        await connection.query('USE smart_hospital;');

        console.log('Reading schema.sql...');
        const schemaPath = path.join(__dirname, '../database/smart_hospital_full.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Executing schema...');
        await connection.query(schemaSql);

        console.log('Generating password hashes...');
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('password123', salt);

        console.log('Inserting default users...');
        // 1. Admin
        await connection.query(`
            INSERT IGNORE INTO users (id, first_name, last_name, email, password_hash, role, phone)
            VALUES (1, 'System', 'Admin', 'admin@smarthospital.com', ?, 'ADMIN', '0000000000')
            ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash);
        `, [hash]);

        // 2. Receptionist
        await connection.query(`
            INSERT IGNORE INTO users (id, first_name, last_name, email, password_hash, role, phone)
            VALUES (2, 'Front', 'Desk', 'reception@smarthospital.com', ?, 'RECEPTIONIST', '1111111111')
            ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash);
        `, [hash]);

        // 3. Doctor
        await connection.query(`
            INSERT IGNORE INTO users (id, first_name, last_name, email, password_hash, role, phone)
            VALUES (3, 'John', 'Doe', 'doctor@smarthospital.com', ?, 'DOCTOR', '2222222222')
            ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash);
        `, [hash]);

        // 4. Patient
        await connection.query(`
            INSERT IGNORE INTO users (id, first_name, last_name, email, password_hash, role, phone)
            VALUES (4, 'Jane', 'Smith', 'patient@smarthospital.com', ?, 'PATIENT', '3333333333')
            ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash);
        `, [hash]);

        console.log('Inserting Departments...');
        await connection.query(`
            INSERT IGNORE INTO departments (id, name, description, is_active) VALUES 
            (1, 'Cardiology', 'Heart and blood vessel diseases', true)
        `);

        console.log('Inserting Doctor Details...');
        await connection.query(`
            INSERT IGNORE INTO doctors (id, user_id, department_id, specialization, qualification, experience_years, consultation_fee)
            VALUES (1, 3, 1, 'Cardiologist', 'MBBS, MD', 10, 1500.00)
        `);
        
        console.log('Inserting Doctor Schedule...');
        await connection.query(`
            INSERT IGNORE INTO doctor_schedules (id, doctor_id, day_of_week, start_time, end_time, slot_duration_minutes, max_patients)
            VALUES (1, 1, 1, '09:00:00', '12:00:00', 15, 12)
        `);

        console.log('Inserting Patient Details...');
        await connection.query(`
            INSERT IGNORE INTO patients (id, user_id, date_of_birth, gender, blood_group, address, emergency_contact)
            VALUES (1, 4, '1990-01-01', 'FEMALE', 'O+', '123 Main St', '9999999999')
        `);

        console.log('Database setup complete!');
        process.exit(0);
    } catch (error) {
        console.error('Error setting up database:', error);
        process.exit(1);
    }
}

setupDatabase();
