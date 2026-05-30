var service = require('./learning.service');

exports.getCourse = async function (req, res) {
  try {
    var data = await service.getCourseDetail(req.params.id, req.user.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markComplete = async function (req, res) {
  try {
    var result = await service.markTopicComplete(req.user.id, req.body.topicId, req.body.moduleId, req.body.courseId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyCourses = async function (req, res) {
  try {
    var courses = await service.getEnrolledCourses(req.user.id);
    res.json({ courses: courses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};