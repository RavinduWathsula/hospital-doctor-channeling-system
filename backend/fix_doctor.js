const mysql = require('mysql2/promise');

async function fixDoctor() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'smart_hospital'
        });

        // 1. Get the doctor's user ID
        const [users] = await connection.query(`SELECT id FROM users WHERE email='doctor@smarthospital.com'`);
        if (users.length === 0) {
            console.log("Doctor user not found!");
            process.exit(1);
        }
        const doctorUserId = users[0].id;

        // 2. Get a department ID (create one if it doesn't exist)
        let [departments] = await connection.query(`SELECT id FROM departments LIMIT 1`);
        let departmentId;
        if (departments.length === 0) {
            await connection.query(`INSERT INTO departments (name, description, head_doctor_id) VALUES ('Cardiology', 'Heart and cardiovascular system', NULL)`);
            const [newDeps] = await connection.query(`SELECT id FROM departments LIMIT 1`);
            departmentId = newDeps[0].id;
        } else {
            departmentId = departments[0].id;
        }

        // 3. Insert into doctors table
        await connection.query(`
            INSERT IGNORE INTO doctors 
            (user_id, department_id, specialization, qualification, experience_years, consultation_fee)
            VALUES (?, ?, 'Cardiologist', 'MD, FACC', 10, 150.00)
        `, [doctorUserId, departmentId]);

        console.log("Doctor profile synced successfully!");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fixDoctor();
