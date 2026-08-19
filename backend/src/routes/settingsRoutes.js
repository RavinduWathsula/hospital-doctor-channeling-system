const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { protect } = require('../middleware/authMiddleware');

// Define routes
router.get('/', settingsController.getAll);

module.exports = router;
