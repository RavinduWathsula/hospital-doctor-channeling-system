const express = require('express');
const router = express.Router();
const appointmentsController = require('../controllers/appointmentsController');
const { protect } = require('../middleware/authMiddleware');

// Define routes
router.get('/', appointmentsController.getAll);

module.exports = router;
