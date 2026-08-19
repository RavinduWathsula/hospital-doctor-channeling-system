const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notificationsController');
const { protect } = require('../middleware/authMiddleware');

// Define routes
router.get('/', notificationsController.getAll);

module.exports = router;
