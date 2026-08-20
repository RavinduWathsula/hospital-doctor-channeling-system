const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notificationsController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/my', notificationsController.getMyNotifications);
router.put('/:id/read', notificationsController.markAsRead);

module.exports = router;
