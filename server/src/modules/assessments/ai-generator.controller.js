const { generateQuestions } = require('./ai-generator.service');

exports.generate = async (req, res) => {
  try {
    const { topic, difficulty, count } = req.body;
    const questions = await generateQuestions(topic, difficulty, count);
    res.json({ questions });
  } catch (err) {
    console.error('AI Generator error:', err);
    res.status(500).json({ error: 'Failed to generate questions. Please try again.' });
  }
};