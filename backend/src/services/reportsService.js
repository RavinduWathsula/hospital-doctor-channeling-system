const pool = require('../config/database');

exports.getDashboardStats = async () => {
    const [patientCount] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role="PATIENT"');
    const [doctorCount] = await pool.query('SELECT COUNT(*) as count FROM doctors');
    const [deptCount] = await pool.query('SELECT COUNT(*) as count FROM departments');
    const [appointments] = await pool.query('SELECT status, COUNT(*) as count FROM appointments GROUP BY status');

    const stats = {
        totalPatients: patientCount[0].count,
        totalDoctors: doctorCount[0].count,
        totalDepartments: deptCount[0].count,
        appointments: {
            pending: 0,
            confirmed: 0,
            completed: 0,
            cancelled: 0
        }
    };

    appointments.forEach(a => {
        if (a.status === 'PENDING') stats.appointments.pending = a.count;
        if (a.status === 'CONFIRMED') stats.appointments.confirmed = a.count;
        if (a.status === 'COMPLETED') stats.appointments.completed = a.count;
        if (a.status === 'CANCELLED') stats.appointments.cancelled = a.count;
    });

    return stats;
};
