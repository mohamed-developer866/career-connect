var service = require('./dashboard.service');

exports.getStats = async function (req, res) {
  try {
    var data = await service.getStats(req.user.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTasks = async function (req, res) {
  try {
    var data = await service.getTodayTasks(req.user.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLeaderboard = async function (req, res) {
  try {
    var data = await service.getLeaderboard();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};