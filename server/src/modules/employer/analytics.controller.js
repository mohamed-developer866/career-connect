const service = require('./analytics.service');

exports.getStats = async (req, res) => {
  try {
    const stats = await service.getEmployerStats(req.user.id);
    res.json({ success: true, stats });
  } catch (err) {
    console.error('Error in getStats:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getApplicationTrend = async (req, res) => {
  try {
    const range = req.query.range || 'week';
    const data = await service.getApplicationTrend(req.user.id, range);
    res.json({ success: true, ...data });
  } catch (err) {
    console.error('Error in getApplicationTrend:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getApplicationStatus = async (req, res) => {
  try {
    const data = await service.getApplicationStatus(req.user.id);
    res.json({ success: true, ...data });
  } catch (err) {
    console.error('Error in getApplicationStatus:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getJobPerformance = async (req, res) => {
  try {
    const jobs = await service.getJobPerformance(req.user.id);
    res.json({ success: true, jobs });
  } catch (err) {
    console.error('Error in getJobPerformance:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getRecentActivity = async (req, res) => {
  try {
    const activities = await service.getRecentActivity(req.user.id);
    res.json({ success: true, activities });
  } catch (err) {
    console.error('Error in getRecentActivity:', err);
    res.status(500).json({ error: err.message });
  }
};