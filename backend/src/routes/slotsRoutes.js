const express = require('express');
const router = express.Router();
const slotsController = require('../controllers/slotsController');
const { protect } = require('../middleware/authMiddleware');

// Define routes
router.get('/', slotsController.getAll);

module.exports = router;
