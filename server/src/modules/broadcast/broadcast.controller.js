var service = require('./broadcast.service');

exports.send = async function (req, res) {
  try {
    var result = await service.sendBroadcast(req.user.id, req.user.fullName, {
      college: req.body.college || 'AMSCE Chennai',
      department: req.body.department || 'All',
      message: req.body.message
    });
    res.json({ success: true, sent: result.sent, message: result.message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send broadcast' });
  }
};

exports.history = async function (req, res) {
  try {
    var history = await service.getBroadcastHistory(req.user.id);
    res.json({ history: history });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load history' });
  }
};