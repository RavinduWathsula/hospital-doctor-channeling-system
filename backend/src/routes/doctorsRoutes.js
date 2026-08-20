const express = require('express');
const router = express.Router();
const doctorsController = require('../controllers/doctorsController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

// Public/Patient route to search doctors
router.get('/search', doctorsController.search);

// Doctor profile for logged in user (Protected)
router.get('/me', authenticateToken, requireRole('DOCTOR'), doctorsController.getMe);

// View specific doctor profile
router.get('/:id', doctorsController.getById);

router.get('/:id/availability', doctorsController.getAvailability);
router.get('/:id/slots', doctorsController.getSlots);

// Admin only routes
router.use(authenticateToken);
router.use(requireRole('ADMIN'));

router.get('/', doctorsController.getAll);
router.post('/', doctorsController.create);
router.patch('/:id/status', doctorsController.updateStatus);

module.exports = router;