const express = require('express');
const router = express.Router();
const prescriptionsController = require('../controllers/prescriptionsController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

// Route for doctors to create a prescription
router.post('/', authenticateToken, requireRole('DOCTOR'), prescriptionsController.createPrescription);

// Route for doctors to get their issued prescriptions
router.get('/doctor', authenticateToken, requireRole('DOCTOR'), prescriptionsController.getDoctorPrescriptions);

// Route for patients to get their prescriptions (or doctors to view a specific patient's prescriptions)
router.get('/patient', authenticateToken, requireRole('PATIENT', 'DOCTOR'), prescriptionsController.getPatientPrescriptions);

module.exports = router;
