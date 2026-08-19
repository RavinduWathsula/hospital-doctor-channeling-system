const express = require('express');
const router = express.Router();
const queuesController = require('../controllers/queuesController');
const { protect } = require('../middleware/authMiddleware');

// Define routes
router.get('/', queuesController.getAll);

module.exports = router;
