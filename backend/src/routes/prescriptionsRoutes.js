const express = require('express');
const router = express.Router();
const prescriptionsController = require('../controllers/prescriptionsController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Route for doctors to create a prescription
router.post('/', protect, authorize('DOCTOR'), prescriptionsController.createPrescription);

// Route for doctors to get their issued prescriptions
router.get('/doctor', protect, authorize('DOCTOR'), prescriptionsController.getDoctorPrescriptions);

// Route for patients to get their prescriptions (or doctors to view a specific patient's prescriptions)
router.get('/patient', protect, authorize('PATIENT', 'DOCTOR'), prescriptionsController.getPatientPrescriptions);

module.exports = router;
