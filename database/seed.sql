-- Seed data for smart_hospital
USE smart_hospital;

-- Insert default admin user (Password: admin123)
-- Replace the hash below with a real bcrypt hash of 'admin123' generated in your backend.
-- Example hash for 'admin123': $2a$10$w/XlX3N7/3p/iWj9E8K6oOhK5n5.A/W1c9w8k3.v9.z1.K1.A5.1
INSERT IGNORE INTO users (first_name, last_name, email, password_hash, role, phone)
VALUES ('System', 'Admin', 'admin@smarthospital.com', '$2a$10$w/XlX3N7/3p/iWj9E8K6oOhK5n5.A/W1c9w8k3.v9.z1.K1.A5.1', 'ADMIN', '1234567890');

-- Insert departments
INSERT IGNORE INTO departments (name, description, is_active) VALUES 
('Cardiology', 'Heart and blood vessel diseases', true),
('Neurology', 'Disorders of the nervous system', true),
('Pediatrics', 'Medical care of infants, children, and adolescents', true),
('Orthopedics', 'Conditions involving the musculoskeletal system', true),
('General Medicine', 'Primary care and general health issues', true);

-- More seeds can be added here
