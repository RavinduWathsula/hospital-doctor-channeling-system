const express = require('express');
const router = express.Router();
const schedulesController = require('../controllers/schedulesController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

router.use(authenticateToken);

// Admin and Doctor routes
router.get('/', requireRole('ADMIN'), schedulesController.getAll);
router.get('/doctor/:doctorId', requireRole('ADMIN', 'DOCTOR'), schedulesController.getByDoctor);
router.post('/', requireRole('ADMIN', 'DOCTOR'), schedulesController.create);
router.put('/:id', requireRole('ADMIN', 'DOCTOR'), schedulesController.update);
router.delete('/:id', requireRole('ADMIN', 'DOCTOR'), schedulesController.delete);

module.exports = router;
