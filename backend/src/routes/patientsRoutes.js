const express = require('express');
const router = express.Router();
const patientsController = require('../controllers/patientsController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

router.use(authenticateToken);
router.get('/', requireRole('ADMIN', 'DOCTOR', 'RECEPTIONIST'), patientsController.getAll);
router.patch('/:id/status', requireRole('ADMIN'), patientsController.updateStatus);

module.exports = router;