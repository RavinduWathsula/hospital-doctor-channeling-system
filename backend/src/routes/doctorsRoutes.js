const express = require('express');
const router = express.Router();
const doctorsController = require('../controllers/doctorsController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

// Public/Patient route to search doctors
router.get('/search', doctorsController.search);

// View specific doctor profile
router.get('/:id', doctorsController.getById);

// Admin only routes
router.use(authenticateToken);
router.use(requireRole('ADMIN'));

router.get('/', doctorsController.getAll);
router.post('/', doctorsController.create);
router.patch('/:id/status', doctorsController.updateStatus);

module.exports = router;