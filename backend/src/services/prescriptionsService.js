const pool = require('../config/database');

exports.createPrescription = async (data) => {
    const { doctor_id, patient_id, appointment_id, notes, items } = data;
    
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        // Insert main prescription
        const [result] = await connection.query(`
            INSERT INTO prescriptions (doctor_id, patient_id, appointment_id, notes)
            VALUES (?, ?, ?, ?)
        `, [doctor_id, patient_id, appointment_id || null, notes || null]);

        const prescriptionId = result.insertId;

        // Insert items
        if (items && items.length > 0) {
            const itemValues = items.map(item => [
                prescriptionId,
                item.medicine_name,
                item.dosage,
                item.frequency,
                item.duration,
                item.instructions || null
            ]);

            await connection.query(`
                INSERT INTO prescription_items (prescription_id, medicine_name, dosage, frequency, duration, instructions)
                VALUES ?
            `, [itemValues]);
        }

        await connection.commit();
        return prescriptionId;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

exports.getDoctorPrescriptions = async (doctorId) => {
    const [prescriptions] = await pool.query(`
        SELECT p.*, 
        u.first_name as patient_first_name, u.last_name as patient_last_name, 
        a.appointment_date, a.appointment_time
        FROM prescriptions p
        JOIN patients pat ON p.patient_id = pat.id
        JOIN users u ON pat.user_id = u.id
        LEFT JOIN appointments a ON p.appointment_id = a.id
        WHERE p.doctor_id = ?
        ORDER BY p.created_at DESC
    `, [doctorId]);

    // Fetch items for each prescription (in a real app, you might do this with a more complex JOIN or separate API call, but this is fine for now)
    for (let p of prescriptions) {
        const [items] = await pool.query(`SELECT * FROM prescription_items WHERE prescription_id = ?`, [p.id]);
        p.items = items;
    }

    return prescriptions;
};

exports.getPatientPrescriptions = async (patientUserId) => {
    const [prescriptions] = await pool.query(`
        SELECT p.*, 
        u.first_name as doctor_first_name, u.last_name as doctor_last_name, doc.specialization,
        a.appointment_date, a.appointment_time
        FROM prescriptions p
        JOIN doctors doc ON p.doctor_id = doc.id
        JOIN users u ON doc.user_id = u.id
        JOIN patients pat ON p.patient_id = pat.id
        LEFT JOIN appointments a ON p.appointment_id = a.id
        WHERE pat.user_id = ?
        ORDER BY p.created_at DESC
    `, [patientUserId]);

    for (let p of prescriptions) {
        const [items] = await pool.query(`SELECT * FROM prescription_items WHERE prescription_id = ?`, [p.id]);
        p.items = items;
    }

    return prescriptions;
};
