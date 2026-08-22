const prescriptionsService = require('../services/prescriptionsService');
const pool = require('../config/database');

exports.createPrescription = async (req, res, next) => {
    try {
        const { patient_id, appointment_id, notes, items } = req.body;
        
        // Ensure the logged in user is a DOCTOR
        if (req.user.role !== 'DOCTOR') {
            return res.status(403).json({ success: false, message: 'Only doctors can create prescriptions' });
        }

        // Get the doctor_id from the users table
        const [doctors] = await pool.query('SELECT id FROM doctors WHERE user_id = ?', [req.user.id]);
        if (doctors.length === 0) {
            return res.status(404).json({ success: false, message: 'Doctor profile not found' });
        }
        const doctor_id = doctors[0].id;

        const prescriptionId = await prescriptionsService.createPrescription({
            doctor_id,
            patient_id,
            appointment_id,
            notes,
            items
        });

        res.status(201).json({ success: true, data: { id: prescriptionId }, message: 'Prescription created successfully' });
    } catch (error) {
        next(error);
    }
};

exports.getDoctorPrescriptions = async (req, res, next) => {
    try {
        if (req.user.role !== 'DOCTOR') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const [doctors] = await pool.query('SELECT id FROM doctors WHERE user_id = ?', [req.user.id]);
        if (doctors.length === 0) {
            return res.status(404).json({ success: false, message: 'Doctor profile not found' });
        }
        const doctor_id = doctors[0].id;

        const prescriptions = await prescriptionsService.getDoctorPrescriptions(doctor_id);
        res.json({ success: true, data: prescriptions });
    } catch (error) {
        next(error);
    }
};

exports.getPatientPrescriptions = async (req, res, next) => {
    try {
        // Patients can view their own, Doctors can view any patient's (if authorized, but for now we'll just check if it's the patient themselves)
        let userIdToFetch = req.user.id;
        
        // If an admin or doctor is requesting for a specific patient, we might need a different route, but here we just assume it's the logged-in patient
        if (req.user.role !== 'PATIENT') {
           // Allow fetching for specific patient if passed in query param (e.g. ?userId=5)
           if(req.query.userId) {
               userIdToFetch = req.query.userId;
           } else {
               return res.status(403).json({ success: false, message: 'Patient user ID required' });
           }
        }

        const prescriptions = await prescriptionsService.getPatientPrescriptions(userIdToFetch);
        res.json({ success: true, data: prescriptions });
    } catch (error) {
        next(error);
    }
};
