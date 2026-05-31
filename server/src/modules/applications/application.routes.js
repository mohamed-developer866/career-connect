var express = require('express');
var router = express.Router();
var { PrismaClient } = require('@prisma/client');
var prisma = new PrismaClient();
var auth = require('../../middlewares/auth');
var service = require('./application.service');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/resumes/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, DOCX files are allowed'));
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: fileFilter
});

// ========== APPLICATION ROUTES ==========

// POST /api/applications/apply
router.post('/apply', auth, upload.single('resume'), async function(req, res) {
  try {
    console.log('📝 Application submission received');
    console.log('Body:', req.body);
    console.log('File:', req.file);
    
    const { jobId, studentName, studentEmail, college, department } = req.body;
    
    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required' });
    }
    
    let resumePath = null;
    let resumeFileName = null;
    if (req.file) {
      resumePath = req.file.path;
      resumeFileName = req.file.originalname;
      console.log(`✅ Resume saved: ${resumePath}`);
    }
    
    const app = await service.applyForJob({
      jobId: jobId,
      studentId: req.user.id,
      studentName: studentName || req.user.fullName,
      studentEmail: studentEmail || req.user.email,
      college: college || req.user.college || "AMSCE Chennai",
      department: department || req.user.department || "Computer Science",
      resume: resumePath,
      resumeFileName: resumeFileName,
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Application submitted successfully!',
      application: app 
    });
  } catch (err) {
    console.error('Error:', err);
    if (err.message === 'You have already applied for this job') {
      return res.status(400).json({ error: err.message, alreadyApplied: true });
    }
    res.status(500).json({ error: err.message });
  }
});

// GET /api/applications/my
router.get('/my', auth, async function(req, res) {
  try {
    const apps = await service.getMyApplications(req.user.id);
    res.json({ applications: apps });
  } catch (err) {
    console.error(err);
    res.status(500).json({ applications: [], error: err.message });
  }
});

// GET /api/applications/job/:jobId
router.get('/job/:jobId', auth, async function(req, res) {
  try {
    const apps = await service.getApplicationsForJob(req.params.jobId);
    res.json({ applications: apps });
  } catch (err) {
    console.error(err);
    res.status(500).json({ applications: [], error: err.message });
  }
});

// ========== ADD THIS MISSING RESUME DOWNLOAD ENDPOINT ==========
// GET /api/applications/:id/resume - Download resume file
router.get('/:id/resume', auth, async function(req, res) {
  try {
    const applicationId = req.params.id;
    console.log(`📄 Downloading resume for application: ${applicationId}`);
    
    const application = await prisma.jobApplication.findUnique({
      where: { id: applicationId }
    });
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    // Check authorization
    const job = await prisma.job.findUnique({
      where: { id: application.jobId }
    });
    
    const isEmployer = req.user.role === 'EMPLOYER' && job?.postedBy === req.user.id;
    const isStudent = req.user.role === 'STUDENT' && application.studentId === req.user.id;
    
    if (!isEmployer && !isStudent) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    if (!application.resume) {
      return res.status(404).json({ error: 'No resume uploaded for this application' });
    }
    
    // Check if file exists on disk
    if (!fs.existsSync(application.resume)) {
      console.error(`❌ Resume file not found: ${application.resume}`);
      return res.status(404).json({ error: 'Resume file not found on server' });
    }
    
    // Get file extension for content type
    const ext = path.extname(application.resume).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.pdf') contentType = 'application/pdf';
    if (ext === '.doc') contentType = 'application/msword';
    if (ext === '.docx') contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    
    // Set headers for inline viewing (opens in browser)
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${application.resumeFileName || 'resume.pdf'}"`);
    
    // Send the file
    res.sendFile(path.resolve(application.resume), (err) => {
      if (err) {
        console.error('Error sending file:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Error sending file' });
        }
      }
    });
  } catch (err) {
    console.error('Error downloading resume:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/applications/:id/status
router.put('/:id/status', auth, async function(req, res) {
  try {
    const app = await service.updateStatus(req.params.id, req.body.status);
    res.json({ success: true, message: 'Status updated', application: app });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;