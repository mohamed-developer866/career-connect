const service = require('./application.service');

exports.apply = async (req, res) => {
  try {
    const app = await service.applyForJob({
      jobId: req.body.jobId,
      studentId: req.user.id,
      studentName: req.body.studentName || req.user.fullName,
      studentEmail: req.body.studentEmail || req.user.email,
      college: req.body.college || "AMSCE Chennai",
      department: req.body.department || "B.Tech AI & DS",
      resume: req.body.resume || null,
    });
    res.status(201).json({ message: '✅ Application submitted successfully!', app });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getMyApps = async (req, res) => {
  try {
    const apps = await service.getMyApplications(req.user.id);
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getByJob = async (req, res) => {
  try {
    const apps = await service.getApplicationsForJob(req.params.jobId);
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const app = await service.updateStatus(req.params.id, req.body.status);
    res.json({ message: 'Status updated', app });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};