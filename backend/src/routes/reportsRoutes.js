const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

router.use(authenticateToken);
router.use(requireRole('ADMIN'));

// @route   GET /api/reports/dashboard-stats
router.get('/dashboard-stats', reportsController.getDashboardStats);

// @route   GET /api/reports/analytics
router.get('/analytics', reportsController.getAnalytics);

module.exports = router;
