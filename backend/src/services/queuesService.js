const pool = require('../config/database');

exports.getAll = async () => {
    const today = new Date().toISOString().split('T')[0];
    
    // Get all today's appointments
    const [appointments] = await pool.query(`
        SELECT a.id, a.doctor_id, a.queue_number, a.status, a.appointment_time, 
        u.first_name, u.last_name, 
        du.first_name as doc_first, du.last_name as doc_last, d.specialization
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        JOIN users u ON p.user_id = u.id
        JOIN doctors d ON a.doctor_id = d.id
        JOIN users du ON d.user_id = du.id
        WHERE a.appointment_date = ? AND a.status NOT IN ('CANCELLED', 'NO_SHOW', 'COMPLETED')
        ORDER BY a.queue_number ASC
    `, [today]);

    // Group by doctor
    const doctorQueues = {};
    appointments.forEach(a => {
        if (!doctorQueues[a.doctor_id]) {
            doctorQueues[a.doctor_id] = {
                doctorId: a.doctor_id,
                doctorName: `${a.doc_first} ${a.doc_last}`,
                specialization: a.specialization,
                currentPatient: null,
                waitingPatients: []
            };
        }
        
        if (a.status === 'IN_CONSULTATION' || a.status === 'CALLED') {
            // Only set if not already set (if there's a data anomaly)
            if (!doctorQueues[a.doctor_id].currentPatient) {
                doctorQueues[a.doctor_id].currentPatient = a;
            }
        } else if (a.status === 'WAITING' || a.status === 'CHECKED_IN') {
            doctorQueues[a.doctor_id].waitingPatients.push(a);
        }
    });

    return Object.values(doctorQueues);
};

exports.getPatientQueue = async (userId) => {
    const today = new Date().toISOString().split('T')[0];

    // Find the patient's appointment for today that is not completed/cancelled
    const [appointments] = await pool.query(`
        SELECT a.id, a.doctor_id, a.queue_number, a.status, a.appointment_time, ds.slot_duration_minutes,
        u.first_name as doctor_first_name, u.last_name as doctor_last_name
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        JOIN doctors d ON a.doctor_id = d.id
        JOIN users u ON d.user_id = u.id
        JOIN doctor_schedules ds ON a.schedule_id = ds.id
        WHERE p.user_id = ? AND a.appointment_date = ? 
        AND a.status IN ('PENDING', 'CONFIRMED', 'WAITING', 'CALLED')
        ORDER BY a.appointment_time ASC
        LIMIT 1
    `, [userId, today]);

    if (appointments.length === 0) {
        return null; // No active appointment today
    }

    const appointment = appointments[0];

    // Find the "Current Queue" for this doctor today
    // Current queue is the lowest queue number that is either CHECKED_IN or IN_CONSULTATION
    const [currentQueueRes] = await pool.query(`
        SELECT MIN(queue_number) as current_queue
        FROM appointments
        WHERE doctor_id = ? AND appointment_date = ? AND status IN ('CALLED', 'IN_CONSULTATION')
    `, [appointment.doctor_id, today]);

    // If no one is checked in or in consultation, current queue might be the next pending
    let current_queue = currentQueueRes[0].current_queue;
    if (!current_queue) {
        const [nextPending] = await pool.query(`
            SELECT MIN(queue_number) as next_q
            FROM appointments
            WHERE doctor_id = ? AND appointment_date = ? AND status IN ('PENDING', 'CONFIRMED', 'WAITING')
        `, [appointment.doctor_id, today]);
        current_queue = nextPending[0].next_q || 0;
    }

    // Calculate patients ahead
    // Number of active appointments (not cancelled/completed) for this doctor today that have a queue number < my queue number
    const [aheadRes] = await pool.query(`
        SELECT COUNT(*) as count
        FROM appointments
        WHERE doctor_id = ? AND appointment_date = ? 
        AND status IN ('WAITING')
        AND queue_number < ?
    `, [appointment.doctor_id, today, appointment.queue_number]);

    const patients_ahead = aheadRes[0].count;
    const estimated_waiting_time = patients_ahead * appointment.slot_duration_minutes;

    return {
        my_queue_number: appointment.queue_number,
        current_queue: current_queue || 0,
        patients_ahead,
        estimated_waiting_time,
        doctor_name: `Dr. ${appointment.doctor_first_name} ${appointment.doctor_last_name}`,
        appointment_status: appointment.status,
        appointment_time: appointment.appointment_time
    };
};

exports.getDoctorQueue = async (userId) => {
    const today = new Date().toISOString().split('T')[0];

    // Get doctor_id for this user
    const [doctors] = await pool.query('SELECT id FROM doctors WHERE user_id = ?', [userId]);
    if (doctors.length === 0) return null;
    const doctor_id = doctors[0].id;

    // Get all today's appointments for this doctor
    const [appointments] = await pool.query(`
        SELECT a.id, a.queue_number, a.status, a.appointment_time, 
        u.first_name, u.last_name, u.email, u.phone
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        JOIN users u ON p.user_id = u.id
        WHERE a.doctor_id = ? AND a.appointment_date = ? 
        AND a.status NOT IN ('CANCELLED')
        ORDER BY a.queue_number ASC
    `, [doctor_id, today]);

    const currentPatient = appointments.find(a => a.status === 'IN_CONSULTATION' || a.status === 'CALLED');
    const waitingPatients = appointments.filter(a => ['PENDING', 'CONFIRMED', 'WAITING', 'CHECKED_IN'].includes(a.status));
    const nextPatient = waitingPatients.length > 0 ? waitingPatients[0] : null;

    return {
        currentPatient,
        waitingPatients,
        nextPatient
    };
};
