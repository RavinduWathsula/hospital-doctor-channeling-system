const express = require('express');
const router = express.Router();
const slotsController = require('../controllers/slotsController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Define routes
router.get('/', slotsController.getAll);

module.exports = router;
