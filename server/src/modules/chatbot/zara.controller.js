const { getZaraTip } = require('./zara.service');
const userService = require('../users/user.service');

exports.getTip = async (req, res) => {
  try {
    const stats = await userService.getStudentStats(req.user.id);
    const tip = await getZaraTip(stats);
    res.json({ tip });
  } catch (err) {
    console.error('Zara error:', err);
    res.json({ tip: "Keep learning consistently! Every day you practice is a step closer to your dream job. 💪" });
  }
};