const service = require('./user.service');

exports.getStats = async (req, res) => {
  try {
    const stats = await service.getStudentStats(req.user.id);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const data = await service.getDashboardData(req.user.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};