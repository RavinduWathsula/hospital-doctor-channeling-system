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

exports.getAnalytics = async (filters) => {
    let apptConditions = [];
    let apptParams = [];
    
    // Always join doctors and departments to allow filtering and grouping
    let baseQuery = `FROM appointments a 
                     JOIN doctors d ON a.doctor_id = d.id 
                     JOIN users u ON d.user_id = u.id 
                     JOIN departments dept ON d.department_id = dept.id`;

    if (filters.startDate) {
        apptConditions.push('a.appointment_date >= ?');
        apptParams.push(filters.startDate);
    }
    if (filters.endDate) {
        apptConditions.push('a.appointment_date <= ?');
        apptParams.push(filters.endDate);
    }
    if (filters.doctorId) {
        apptConditions.push('a.doctor_id = ?');
        apptParams.push(filters.doctorId);
    }
    if (filters.departmentId) {
        apptConditions.push('d.department_id = ?');
        apptParams.push(filters.departmentId);
    }
    if (filters.status) {
        apptConditions.push('a.status = ?');
        apptParams.push(filters.status);
    }

    let baseWhere = apptConditions.length > 0 ? 'WHERE ' + apptConditions.join(' AND ') : '';

    // 1. Overall Stats
    const [totalApps] = await pool.query(`SELECT COUNT(*) as count ${baseQuery} ${baseWhere}`, apptParams);
    
    let cancelWhere = apptConditions.length > 0 ? baseWhere + " AND a.status = 'CANCELLED'" : "WHERE a.status = 'CANCELLED'";
    const [cancelledApps] = await pool.query(`SELECT COUNT(*) as count ${baseQuery} ${cancelWhere}`, apptParams);
    
    let noShowWhere = apptConditions.length > 0 ? baseWhere + " AND a.status = 'NO_SHOW'" : "WHERE a.status = 'NO_SHOW'";
    const [noShowApps] = await pool.query(`SELECT COUNT(*) as count ${baseQuery} ${noShowWhere}`, apptParams);

    // Patient Registrations (Independent of appointments)
    let patConditions = ["role = 'PATIENT'"];
    let patParams = [];
    if (filters.startDate) {
        patConditions.push('DATE(created_at) >= ?');
        patParams.push(filters.startDate);
    }
    if (filters.endDate) {
        patConditions.push('DATE(created_at) <= ?');
        patParams.push(filters.endDate);
    }
    let patWhere = 'WHERE ' + patConditions.join(' AND ');
    const [newPatients] = await pool.query(`SELECT COUNT(*) as count FROM users ${patWhere}`, patParams);

    // 2. Trend Data (Line Chart)
    const [trendData] = await pool.query(`
        SELECT 
            DATE_FORMAT(a.appointment_date, '%Y-%m-%d') as date,
            COUNT(*) as appointments,
            SUM(CASE WHEN a.status = 'CANCELLED' THEN 1 ELSE 0 END) as cancellations,
            SUM(CASE WHEN a.status = 'NO_SHOW' THEN 1 ELSE 0 END) as noShows
        ${baseQuery}
        ${baseWhere}
        GROUP BY a.appointment_date
        ORDER BY a.appointment_date ASC
    `, apptParams);

    // 3. Doctor Workload (Bar Chart)
    const [doctorWorkload] = await pool.query(`
        SELECT CONCAT('Dr. ', u.first_name, ' ', u.last_name) as doctorName, COUNT(*) as count
        ${baseQuery}
        ${baseWhere}
        GROUP BY a.doctor_id
        ORDER BY count DESC
    `, apptParams);

    // 4. Department Performance (Pie Chart)
    const [departmentPerformance] = await pool.query(`
        SELECT dept.name as departmentName, COUNT(*) as count
        ${baseQuery}
        ${baseWhere}
        GROUP BY d.department_id
        ORDER BY count DESC
    `, apptParams);

    // 5. Status Distribution (Donut Chart)
    const [statusDistribution] = await pool.query(`
        SELECT a.status as name, COUNT(*) as value
        ${baseQuery}
        ${baseWhere}
        GROUP BY a.status
    `, apptParams);

    // 6. Raw Data (Data Table)
    const [rawData] = await pool.query(`
        SELECT 
            a.id,
            a.appointment_date, 
            a.appointment_time, 
            a.status,
            a.queue_number,
            CONCAT('Dr. ', u.first_name, ' ', u.last_name) as doctor_name,
            dept.name as department_name,
            CONCAT(pat_u.first_name, ' ', pat_u.last_name) as patient_name
        ${baseQuery}
        JOIN patients p ON a.patient_id = p.id
        JOIN users pat_u ON p.user_id = pat_u.id
        ${baseWhere}
        ORDER BY a.appointment_date DESC, a.appointment_time DESC
        LIMIT 500
    `, apptParams);

    return {
        stats: {
            totalAppointments: totalApps[0].count,
            cancellations: cancelledApps[0].count,
            noShows: noShowApps[0].count,
            newPatients: newPatients[0].count
        },
        trendData,
        doctorWorkload,
        departmentPerformance,
        statusDistribution,
        rawData
    };
};
