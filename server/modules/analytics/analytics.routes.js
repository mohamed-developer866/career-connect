const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const service = require('./analytics.service');

router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await service.getUserStats(req.user.id);
    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/skills', auth, async (req, res) => {
  try {
    const skills = await service.getUserSkills(req.user.id);
    res.json({ success: true, skills });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/activities', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const activities = await service.getUserActivities(req.user.id, limit);
    res.json({ success: true, activities });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/performance', auth, async (req, res) => {
  try {
    const range = req.query.range || 'week';
    const performance = await service.getUserPerformance(req.user.id, range);
    res.json({ success: true, ...performance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;