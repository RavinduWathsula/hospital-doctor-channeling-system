const mysql = require('mysql2/promise');

async function fixAccounts() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'smart_hospital'
        });

        // Safe bcrypt hash for 'password123'
        const hash = '$2b$10$DByVFst8q7rWnZEpdQ6S/OAIgvLDtC1t1EcwmwXwjfQ78d2.kYTre';

        // Insert Admin (without specifying ID so it auto-increments properly)
        await connection.query(`
            INSERT IGNORE INTO users (first_name, last_name, email, password_hash, role, phone) 
            VALUES ('System', 'Admin', 'admin@smarthospital.com', ?, 'ADMIN', '0000000000')
        `, [hash]);

        // Fix the doctor's password hash (which got corrupted earlier)
        await connection.query(`
            UPDATE users SET password_hash = ? WHERE email = 'doctor@smarthospital.com'
        `, [hash]);

        console.log("Accounts fixed successfully!");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fixAccounts();
