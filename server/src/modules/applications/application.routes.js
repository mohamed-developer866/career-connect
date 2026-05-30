var express = require('express');
var router = express.Router();
var { PrismaClient } = require('@prisma/client');
var prisma = new PrismaClient();
var auth = require('../../middlewares/auth');
var service = require('./application.service');

// POST /api/applications/apply — Student applies for a job (WITH DUPLICATE CHECK)
router.post('/apply', auth, async function(req, res) {
  try {
    // Use the service which has the duplicate check
    const app = await service.applyForJob({
      jobId: req.body.jobId,
      studentId: req.user.id,
      studentName: req.body.studentName || req.user.fullName,
      studentEmail: req.body.studentEmail || req.user.email,
      college: req.body.college || req.user.college,
      department: req.body.department || req.user.department,
      resume: req.body.resume || null,
    });
    res.status(201).json({ 
      success: true, 
      message: 'Application submitted successfully!',
      application: app 
    });
  } catch (err) {
    // Handle duplicate application error
    if (err.message === 'You have already applied for this job') {
      return res.status(400).json({ 
        error: err.message,
        alreadyApplied: true 
      });
    }
    res.status(500).json({ error: err.message });
  }
});

// GET /api/applications/my — Get student's applications
router.get('/my', auth, async function(req, res) {
  try {
    const apps = await service.getMyApplications(req.user.id);
    res.json({ applications: apps });
  } catch (err) {
    console.error(err);
    res.status(500).json({ applications: [], error: err.message });
  }
});

// GET /api/applications/job/:jobId — Get applications for a job
router.get('/job/:jobId', auth, async function(req, res) {
  try {
    const apps = await service.getApplicationsForJob(req.params.jobId);
    res.json({ applications: apps });
  } catch (err) {
    console.error(err);
    res.status(500).json({ applications: [], error: err.message });
  }
});

// PUT /api/applications/:id/status — Update application status
router.put('/:id/status', auth, async function(req, res) {
  try {
    const app = await service.updateStatus(req.params.id, req.body.status);
    res.json({ 
      success: true, 
      message: 'Status updated successfully',
      application: app 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;