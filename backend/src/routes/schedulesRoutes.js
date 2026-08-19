const express = require('express');
const router = express.Router();
const schedulesController = require('../controllers/schedulesController');
const { protect } = require('../middleware/authMiddleware');

// Define routes
router.get('/', schedulesController.getAll);

module.exports = router;
