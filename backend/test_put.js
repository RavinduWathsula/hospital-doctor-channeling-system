const mysql = require('mysql2/promise');
require('dotenv').config({ path: './.env' });

async function test() {
    // 1. Manually generate a token for rivi@gmail.com
    const jwt = require('jsonwebtoken');
    const pool = mysql.createPool({
        host: process.env.DATABASE_HOST || 'localhost',
        user: process.env.DATABASE_USER || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'smart_hospital'
    });

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', ['rivi@gmail.com']);
    if (rows.length === 0) {
        console.log('User not found');
        return;
    }
    const user = rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1d' });

    // 2. PUT /api/doctors/me
    const putRes = await fetch('http://localhost:5000/api/doctors/me', {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            phone: '1234567890',
            specialization: 'MBBS',
            qualifications: 'MD',
            experienceYears: 6,
            consultationFee: 1500
        })
    });
    const putData = await putRes.json();
    console.log('PUT /me:', putRes.status, putData);
    pool.end();
}

test();
