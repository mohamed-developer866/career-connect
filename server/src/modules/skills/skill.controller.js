var service = require('./skill.service');

exports.calculateSkills = async function (req, res) {
  try {
    var skills = await service.calculateStudentSkills(req.user.id);
    res.json({ skills: skills });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMySkills = async function (req, res) {
  try {
    var skills = await service.getStudentSkills(req.user.id);
    res.json({ skills: skills });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCollegeRankings = async function (req, res) {
  try {
    var rankings = await service.getCollegeSkillRanking();
    res.json({ colleges: rankings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};