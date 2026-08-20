const express = require('express');
const router = express.Router();
const queuesController = require('../controllers/queuesController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

// Define routes
router.get('/', queuesController.getAll);
router.get('/patient', authenticateToken, requireRole('PATIENT'), queuesController.getPatientQueue);
router.get('/doctor', authenticateToken, requireRole('DOCTOR'), queuesController.getDoctorQueue);

module.exports = router;
