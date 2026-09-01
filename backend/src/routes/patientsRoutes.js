const express = require('express');
const router = express.Router();
const patientsController = require('../controllers/patientsController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

router.use(authenticateToken);
router.get('/me', requireRole('PATIENT'), patientsController.getMe);
router.put('/me', requireRole('PATIENT'), patientsController.updateMe);
router.put('/me/password', requireRole('PATIENT'), patientsController.updatePassword);

router.get('/', requireRole('ADMIN', 'DOCTOR', 'RECEPTIONIST'), patientsController.getAll);
router.patch('/:id/status', requireRole('ADMIN'), patientsController.updateStatus);
router.put('/:id', requireRole('ADMIN', 'RECEPTIONIST'), patientsController.updatePatientAdmin);

module.exports = router;