const mysql = require('mysql2/promise');

async function updatePassword() {
    try {
        const pool = mysql.createPool({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'smart_hospital'
        });

        // The hash string below will NOT be interpolated by Node.js unless using template literals
        const hash = '$2b$10$7mW2UD8USgEZQmLB5gvZT.6V.T5Nu3140Aav9OEdsNeTHNmTjX.x2';

        const [result] = await pool.execute(
            'UPDATE users SET password_hash = ? WHERE email = ?',
            [hash, 'admin@smarthospital.com']
        );

        console.log('Password updated successfully. Rows affected:', result.affectedRows);

        // Verify the update
        const [rows] = await pool.query('SELECT password_hash FROM users WHERE email = ?', ['admin@smarthospital.com']);
        console.log('New hash in DB:', rows[0].password_hash);
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

updatePassword();
