const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const controller = require('./analytics.controller');

// GET /api/employer/stats - Get employer statistics
router.get('/stats', auth, controller.getStats);

// GET /api/employer/application-trend - Get application trend over time
router.get('/application-trend', auth, controller.getApplicationTrend);

// GET /api/employer/application-status - Get application status distribution
router.get('/application-status', auth, controller.getApplicationStatus);

// GET /api/employer/jobs/performance - Get performance metrics for each job
router.get('/jobs/performance', auth, controller.getJobPerformance);

// GET /api/employer/recent-activity - Get recent recruitment activity
router.get('/recent-activity', auth, controller.getRecentActivity);

module.exports = router;