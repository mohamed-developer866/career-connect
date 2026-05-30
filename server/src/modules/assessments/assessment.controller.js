const service = require('./assessment.service');

exports.create = async (req, res) => {
  try {
    const assessment = await service.createAssessment(req.body);
    res.status(201).json(assessment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const assessment = await service.getAssessmentById(req.params.id);
    if (!assessment) return res.status(404).json({ error: 'Assessment not found' });
    res.json(assessment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const assessments = await service.listAssessments();
    res.json(assessments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};