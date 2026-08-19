const express = require('express');
const router = express.Router();
const departmentsController = require('../controllers/departmentsController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

router.use(authenticateToken);
router.get('/', departmentsController.getAll);
router.post('/', requireRole('ADMIN'), departmentsController.create);
router.put('/:id', requireRole('ADMIN'), departmentsController.update);
router.delete('/:id', requireRole('ADMIN'), departmentsController.delete);

module.exports = router;