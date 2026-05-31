const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const controller = require('./analytics.controller');

// GET /api/analytics/stats - Get user stats
router.get('/stats', auth, controller.getStats);

// GET /api/analytics/skills - Get user skills
router.get('/skills', auth, controller.getSkills);

// GET /api/analytics/activities - Get recent activities
router.get('/activities', auth, controller.getActivities);

// GET /api/analytics/performance - Get performance over time
router.get('/performance', auth, controller.getPerformance);

module.exports = router;