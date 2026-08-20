CREATE DATABASE IF NOT EXISTS smart_hospital;
USE smart_hospital;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nic VARCHAR(20) UNIQUE,
    role ENUM('PATIENT', 'DOCTOR', 'RECEPTIONIST', 'ADMIN') NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    date_of_birth DATE,
    gender ENUM('MALE', 'FEMALE', 'OTHER'),
    blood_group VARCHAR(5),
    address TEXT,
    emergency_contact VARCHAR(20),
    medical_history TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    department_id INT NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    qualification VARCHAR(255) NOT NULL,
    experience_years INT DEFAULT 0,
    consultation_fee DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS doctor_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id INT NOT NULL,
    day_of_week INT NOT NULL CHECK(day_of_week BETWEEN 1 AND 7), -- 1=Monday, 7=Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration_minutes INT NOT NULL DEFAULT 15,
    max_patients INT NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    UNIQUE KEY unique_schedule (doctor_id, day_of_week),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    schedule_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    queue_number INT NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'CHECKED_IN', 'WAITING', 'CALLED', 'IN_CONSULTATION', 'COMPLETED', 'CANCELLED', 'NO_SHOW') DEFAULT 'PENDING',
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE RESTRICT,
    FOREIGN KEY (schedule_id) REFERENCES doctor_schedules(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(50) NOT NULL,
    entity_id INT,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(50) UNIQUE NOT NULL,
    setting_value TEXT
);

-- 2. Clear existing data (optional, ensures clean slate)
TRUNCATE TABLE appointments;
TRUNCATE TABLE doctor_schedules;
TRUNCATE TABLE doctors;
TRUNCATE TABLE departments;
TRUNCATE TABLE patients;
TRUNCATE TABLE users;

-- 3. Insert Default Users
-- All passwords are set to: password123
INSERT IGNORE INTO users (id, first_name, last_name, email, password_hash, role, phone) VALUES 
(1, 'System', 'Admin', 'admin@smarthospital.com', '$2b$10$DByVFst8q7rWnZEpdQ6S/OAIgvLDtC1t1EcwmwXwjfQ78d2.kYTre', 'ADMIN', '0000000000'),
(2, 'Front', 'Desk', 'reception@smarthospital.com', '$2b$10$DByVFst8q7rWnZEpdQ6S/OAIgvLDtC1t1EcwmwXwjfQ78d2.kYTre', 'RECEPTIONIST', '1111111111'),
(3, 'John', 'Doe', 'doctor@smarthospital.com', '$2b$10$DByVFst8q7rWnZEpdQ6S/OAIgvLDtC1t1EcwmwXwjfQ78d2.kYTre', 'DOCTOR', '2222222222'),
(4, 'Jane', 'Smith', 'patient@smarthospital.com', '$2b$10$DByVFst8q7rWnZEpdQ6S/OAIgvLDtC1t1EcwmwXwjfQ78d2.kYTre', 'PATIENT', '3333333333');

-- 4. Insert Departments
INSERT IGNORE INTO departments (id, name, description, is_active) VALUES 
(1, 'Cardiology', 'Heart and blood vessel diseases', true),
(2, 'Neurology', 'Disorders of the nervous system', true),
(3, 'Pediatrics', 'Medical care of infants, children, and adolescents', true),
(4, 'Orthopedics', 'Conditions involving the musculoskeletal system', true),
(5, 'General Medicine', 'Primary care and general health issues', true);

-- 5. Insert Doctor Details
INSERT IGNORE INTO doctors (id, user_id, department_id, specialization, qualification, experience_years, consultation_fee)
VALUES (1, 3, 1, 'Cardiologist', 'MBBS, MD', 10, 1500.00);

-- 6. Insert Doctor Schedule (Available Monday = 1, 09:00 to 12:00)
INSERT IGNORE INTO doctor_schedules (id, doctor_id, day_of_week, start_time, end_time, slot_duration_minutes, max_patients)
VALUES (1, 1, 1, '09:00:00', '12:00:00', 15, 12);

-- 7. Insert Patient Details
INSERT IGNORE INTO patients (id, user_id, date_of_birth, gender, blood_group, address, emergency_contact)
VALUES (1, 4, '1990-01-01', 'FEMALE', 'O+', '123 Main St', '9999999999');

SET FOREIGN_KEY_CHECKS = 1;
