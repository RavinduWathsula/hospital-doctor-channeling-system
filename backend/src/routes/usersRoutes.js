const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

router.use(authenticateToken);
router.use(requireRole('ADMIN'));

router.get('/', usersController.getAll);
router.patch('/:id/status', usersController.updateStatus);

module.exports = router;