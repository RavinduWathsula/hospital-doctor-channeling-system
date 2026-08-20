const express = require('express');
const router = express.Router();
const appointmentsController = require('../controllers/appointmentsController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

// Get all appointments (Admin/Receptionist)
router.get('/', authenticateToken, requireRole('ADMIN', 'RECEPTIONIST'), appointmentsController.getAll);

// Patient specific routes
router.get('/my-appointments', authenticateToken, requireRole('PATIENT'), appointmentsController.getPatientAppointments);
router.post('/', authenticateToken, requireRole('PATIENT'), appointmentsController.create);
router.put('/:id/cancel', authenticateToken, requireRole('PATIENT'), appointmentsController.cancel);

// Doctor specific routes
router.get('/doctor-appointments', authenticateToken, requireRole('DOCTOR'), appointmentsController.getDoctorAppointments);
router.put('/:id/status', authenticateToken, requireRole('DOCTOR'), appointmentsController.updateStatus);

// Get specific appointment details
router.get('/:id', authenticateToken, appointmentsController.getAppointmentById);

// Admin/Receptionist status update
router.put('/:id/admin-status', authenticateToken, requireRole('ADMIN', 'RECEPTIONIST'), appointmentsController.updateAdminStatus);

module.exports = router;
