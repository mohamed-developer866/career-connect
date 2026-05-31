const service = require('./analytics.service');

exports.getStats = async (req, res) => {
  try {
    const stats = await service.getUserStats(req.user.id);
    if (!stats) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ success: true, stats });
  } catch (err) {
    console.error('Error in getStats:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getSkills = async (req, res) => {
  try {
    const skills = await service.getUserSkills(req.user.id);
    res.json({ success: true, skills });
  } catch (err) {
    console.error('Error in getSkills:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getActivities = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const activities = await service.getUserActivities(req.user.id, limit);
    res.json({ success: true, activities });
  } catch (err) {
    console.error('Error in getActivities:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getPerformance = async (req, res) => {
  try {
    const range = req.query.range || 'week';
    const performance = await service.getUserPerformance(req.user.id, range);
    res.json({ success: true, ...performance });
  } catch (err) {
    console.error('Error in getPerformance:', err);
    res.status(500).json({ error: err.message });
  }
};